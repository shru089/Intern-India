import os
from datetime import datetime, timedelta, timezone
import jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

ENV = os.getenv("ENV", "development").lower()
SECRET_KEY = os.getenv("JWT_SECRET")
if ENV != "development" and not SECRET_KEY:
    raise RuntimeError("JWT_SECRET environment variable must be set in non-development environments.")
# fallback for local dev (explicit)
if not SECRET_KEY:
    SECRET_KEY = "dev_secret_change"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(password: str, password_hash: str) -> bool:
    return pwd_context.verify(password, password_hash)

def create_access_token(subject: str, role: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": subject, "exp": expire, "role": role}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def require_admin(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        role: str = payload.get("role")
        if role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin privileges required",
            )
    except jwt.PyJWTError:
        raise credentials_exception


