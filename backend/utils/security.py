import os
import re
import time
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any, List, Tuple, Union
from jose import JWTError, jwt
from jose.exceptions import ExpiredSignatureError, JWTClaimsError
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status, Request, Security
from fastapi.security import OAuth2PasswordBearer, HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorDatabase
from pydantic import BaseModel, Field, validator
from bson import ObjectId
import logging
import hashlib
import hmac
from functools import lru_cache
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from ..database import get_mongo_db as get_db

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Security configuration
@lru_cache()
def get_secret_key() -> str:
    """Get the secret key from environment with caching."""
    secret = os.getenv("SECRET_KEY")
    if not secret:
        if os.getenv("ENV", "development") == "production":
            raise RuntimeError("SECRET_KEY must be set in production environment")
        logger.warning("Using default SECRET_KEY. Change this in production!")
        return "dev-secret-key-change-in-production"
    return secret

# Security constants
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))  # 24 hours
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))
PASSWORD_MIN_LENGTH = 12
PASSWORD_MAX_ATTEMPTS = 5
PASSWORD_LOCKOUT_TIME = 300  # 5 minutes in seconds
RATE_LIMIT = "1000/day;100/hour;10/minute"

# Rate limiter
limiter = Limiter(key_func=get_remote_address)
rate_limit_exceeded_handler = _rate_limit_exceeded_handler

# Security utilities
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    bcrypt__rounds=12,  # Slower for better security
)

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="auth/token",
    auto_error=False,
    scheme_name="JWT"
)

# Rate limiting for auth endpoints
login_limiter = Limiter(key_func=get_remote_address)

# Password policy
class PasswordPolicy:
    @staticmethod
    def validate_password_strength(password: str) -> Tuple[bool, str]:
        """Enforce strong password policy."""
        if len(password) < PASSWORD_MIN_LENGTH:
            return False, f"Password must be at least {PASSWORD_MIN_LENGTH} characters long"
        if not re.search(r"[A-Z]", password):
            return False, "Password must contain at least one uppercase letter"
        if not re.search(r"[a-z]", password):
            return False, "Password must contain at least one lowercase letter"
        if not re.search(r"\d", password):
            return False, "Password must contain at least one number"
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
            return False, "Password must contain at least one special character"
        return True, ""

# Token models
class TokenPayload(BaseModel):
    sub: str  # user ID
    exp: int
    type: str  # access or refresh
    scopes: List[str] = []
    jti: str  # Unique token identifier

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    refresh_token: str
    refresh_expires_in: int

# Password hashing and verification
def get_password_hash(password: str) -> str:
    """Generate a secure password hash with a random salt."""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash using constant-time comparison."""
    return pwd_context.verify(plain_password, hashed_password)

# Token creation and validation
def create_jwt_token(
    subject: str,
    token_type: str = "access",
    expires_delta: Optional[timedelta] = None,
    scopes: Optional[List[str]] = None,
) -> str:
    """Create a new JWT token."""
    if token_type not in ["access", "refresh"]:
        raise ValueError("Token type must be 'access' or 'refresh'")

    now = datetime.utcnow()
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=15)

    # Generate a unique token ID
    jti = hashlib.sha256(f"{subject}{now.timestamp()}".encode()).hexdigest()
    
    to_encode = {
        "sub": subject,
        "exp": expire,
        "iat": now,
        "type": token_type,
        "jti": jti,
    }
    
    if scopes:
        to_encode["scopes"] = scopes

    return jwt.encode(
        to_encode,
        get_secret_key(),
        algorithm=ALGORITHM,
    )

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash."""
    return pwd_context.verify(plain_password, hashed_password)

# Token utilities
def create_access_token(
    subject: Union[str, ObjectId], 
    token_type: str = "access",
    expires_delta: Optional[timedelta] = None,
    role: Optional[str] = None,
    scopes: Optional[list[str]] = None
) -> str:
    """Create a new JWT token."""
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    to_encode = {
        "sub": str(subject),
        "exp": expire,
        "type": token_type,
        "iat": datetime.now(timezone.utc),
    }
    
    if role:
        to_encode["role"] = role
    if scopes:
        to_encode["scopes"] = scopes
    
    return jwt.encode(to_encode, get_secret_key(), algorithm=ALGORITHM)

def create_refresh_token(subject: Union[str, ObjectId], role: Optional[str] = None) -> str:
    """Create a refresh token with longer expiration."""
    expires_delta = timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    return create_access_token(subject, "refresh", expires_delta, role)

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Security(HTTPBearer(auto_error=False)),
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> Dict[str, Any]:
    """
    Dependency to get the current user from the JWT token.
    
    Args:
        credentials: The HTTP Authorization header containing the JWT token
        db: The database connection
        
    Returns:
        The authenticated user's data
        
    Raises:
        HTTPException: If the token is invalid, expired, or the user doesn't exist
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    token = credentials.credentials
    
    try:
        # Verify the token
        payload = jwt.decode(
            token,
            get_secret_key(),
            algorithms=[ALGORITHM],
            options={"require": ["exp", "iat", "sub", "type", "jti"]},
        )
        
        # Validate token type
        if payload.get("type") != "access":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Invalid token type",
            )
            
        # Check if token is blacklisted
        user_id = payload.get("sub")
        if await is_token_blacklisted(user_id, payload.get("jti"), db):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has been revoked",
            )
        
        # Get user from database
        user = await db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )
            
        # Check if user is active
        if not user.get("is_active", True):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is disabled",
            )
            
        return user
        
    except ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except JWTError as e:
        logger.error(f"JWT validation error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

async def is_token_blacklisted(user_id: str, jti: str, db: AsyncIOMotorDatabase) -> bool:
    """Check if a token is blacklisted."""
    if not user_id or not jti:
        return True
        
    # Check if token is in the blacklist
    blacklisted = await db.token_blacklist.find_one({
        "user_id": user_id,
        "jti": jti,
        "expires_at": {"$gt": datetime.utcnow()}
    })
    
    return blacklisted is not None

# Role-based access control
class RoleChecker:
    def __init__(self, allowed_roles: list[str]):
        self.allowed_roles = allowed_roles

    async def __call__(self, user: Dict[str, Any] = Depends(get_current_user)) -> bool:
        """
        Check if the current user has the required role.
        
        Args:
            user: The authenticated user's data
            
        Returns:
            bool: True if the user has the required role
            
        Raises:
            HTTPException: If the user doesn't have the required role
        """
        if user.get("role") not in self.allowed_roles:
            logger.warning(f"Unauthorized access attempt by user: {user.get('_id')}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Operation not permitted"
            )
        return True

    @staticmethod
    async def require_admin(user: Dict[str, Any] = Depends(get_current_user)) -> bool:
        """
        Check if the current user is an admin.
        
        Args:
            user: The authenticated user's data
            
        Returns:
            bool: True if the user is an admin
            
        Raises:
            HTTPException: If the user is not an admin
        """
        if user.get("role") != "admin":
            logger.warning(f"Admin access denied for user: {user.get('_id')}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin privileges required"
            )
        return True

# Rate limiting utilities
class RateLimiter:
    """In-memory rate limiter (replace with Redis in production)."""
    _instance = None
    _rate_limits = {}
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(RateLimiter, cls).__new__(cls)
        return cls._instance
    
    async def is_rate_limited(
        self,
        key: str,
        limit: int,
        window: int
    ) -> Tuple[bool, Dict[str, Any]]:
        """Check if a request should be rate limited."""
        now = time.time()
        window_start = now - window
        
        # Clean up old entries
        if key in self._rate_limits:
            self._rate_limits[key] = [t for t in self._rate_limits[key] if t > window_start]
        else:
            self._rate_limits[key] = []
        
        # Check rate limit
        if len(self._rate_limits[key]) >= limit:
            return True, {
                "limit": limit,
                "remaining": 0,
                "reset": int(self._rate_limits[key][0] + window)
            }
        
        # Add current request
        self._rate_limits[key].append(now)
        
        return False, {
            "limit": limit,
            "remaining": limit - len(self._rate_limits[key]),
            "reset": int(now + window)
        }

# Initialize rate limiter
rate_limiter = RateLimiter()

def get_rate_limiter() -> RateLimiter:
    """Dependency to get the rate limiter instance."""
    return rate_limiter

# Example: Create role-based dependencies
admin_required = RoleChecker(["admin"])
org_admin_required = RoleChecker(["org_admin", "admin"])
any_auth_user = RoleChecker(["user", "org_admin", "admin"])
# Rate limiting (example implementation)
class RateLimiter:
    def __init__(self, times: int, seconds: int):
        self.times = times
        self.seconds = seconds
        self.requests = {}
    
    async def __call__(self, request: Request) -> bool:
        client_host = request.client.host
        now = datetime.now(timezone.utc)
        
        if client_host not in self.requests:
            self.requests[client_host] = []
        
        # Remove old timestamps
        self.requests[client_host] = [
            ts for ts in self.requests[client_host]
            if (now - ts).seconds <= self.seconds
        ]
        
        if len(self.requests[client_host]) >= self.times:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many requests"
            )
        
        self.requests[client_host].append(now)
        return True

# Example rate limiter (10 requests per minute)
rate_limiter = RateLimiter(times=10, seconds=60)


# ── Simple admin guard (used by routers) ──────────────────────────────────────

async def require_admin(current_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
    """FastAPI dependency: raises 403 if the user is not an admin."""
    if current_user.get("role") != "admin" and not current_user.get("is_superuser"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required",
        )
    return current_user
