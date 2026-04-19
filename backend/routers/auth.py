"""
Authentication router.

Endpoints
---------
POST /auth/register  — Create a new account, returns JWT
POST /auth/login     — Login with email + password, returns JWT
GET  /auth/me        — Return the current authenticated user's profile
POST /auth/token     — OAuth2 token endpoint (form-based, for Swagger UI)
"""

import os
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta
from typing import Optional

from bson import ObjectId
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.user_sql import UserSQL
from ..models.user import UserCreate


load_dotenv()

SECRET_KEY = os.getenv("JWT_SECRET", "change-me-in-production")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")

router = APIRouter()


# ── Helpers ───────────────────────────────────────────────────────────────────

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> UserSQL:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(UserSQL).filter(UserSQL.email == email).first()
    if user is None:
        raise credentials_exception
    return user


async def require_admin(current_user: UserSQL = Depends(get_current_user)) -> UserSQL:
    if not getattr(current_user, "is_superuser", False):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return current_user


# ── Request / Response models ─────────────────────────────────────────────────

class LoginBody(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register_user(user: UserCreate, db: Session = Depends(get_db)):
    if db.query(UserSQL).filter(UserSQL.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = UserSQL(
        email=user.email,
        hashed_password=get_password_hash(user.password),
        full_name=user.full_name,
        role=user.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    access_token = create_access_token(data={"sub": new_user.email})
    return TokenResponse(access_token=access_token)


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginBody, db: Session = Depends(get_db)):
    user = db.query(UserSQL).filter(UserSQL.email == body.email).first()
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": user.email})
    return TokenResponse(access_token=access_token)


@router.post("/token", response_model=TokenResponse, include_in_schema=False)
async def token_for_swagger(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    """OAuth2 compatible token endpoint used by Swagger UI."""
    user = db.query(UserSQL).filter(UserSQL.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect credentials")
    return TokenResponse(access_token=create_access_token({"sub": user.email}))


@router.get("/me")
async def get_me(current_user: UserSQL = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "fullName": current_user.full_name,
        "role": current_user.role,
        "is_active": current_user.is_active,
        "is_superuser": current_user.is_superuser
    }

