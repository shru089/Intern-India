from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db, Base, engine
from ..models.user import User, Role
from ..schemas import UserCreate, Token, UserLogin
from ..utils.security import (
    hash_password, verify_password, create_access_token, get_current_user
)
from .. import schemas

Base.metadata.create_all(bind=engine)

router = APIRouter()


@router.post("/register", response_model=Token)
def register(user: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    u = User(
        email=user.email,
        password_hash=hash_password(user.password),
        name=user.name,
        role=Role(user.role),
    )
    db.add(u)
    db.commit()
    db.refresh(u)
    token = create_access_token(str(u.id), u.role.value)
    return Token(access_token=token)


@router.post("/login", response_model=Token)
def login(body: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token(str(user.id), user.role.value)
    return Token(access_token=token)


