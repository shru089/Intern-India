import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# ── SQLAlchemy ────────────────────────────────────────────────────────────────
SQLALCH_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./intern_india.db")

_connect_args = {"check_same_thread": False} if "sqlite" in SQLALCH_DATABASE_URL else {}
engine = create_engine(SQLALCH_DATABASE_URL, connect_args=_connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


# ── FastAPI Dependencies ──────────────────────────────────────────────────────

def get_db():
    """SQLAlchemy session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

