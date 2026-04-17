import os
from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# ── MongoDB ───────────────────────────────────────────────────────────────────
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/")
DB_NAME = os.getenv("MONGODB_DB", "intern_india")


class MongoDB:
    client: Optional[AsyncIOMotorClient] = None

    @classmethod
    async def get_database(cls):
        if cls.client is None:
            cls.client = AsyncIOMotorClient(MONGODB_URI)
        return cls.client[DB_NAME]

    @classmethod
    async def close_connection(cls):
        if cls.client:
            cls.client.close()
            cls.client = None


# ── SQLAlchemy (used by the scraper layer) ────────────────────────────────────
SQLALCH_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./intern_india.db")

_connect_args = {"check_same_thread": False} if "sqlite" in SQLALCH_DATABASE_URL else {}
engine = create_engine(SQLALCH_DATABASE_URL, connect_args=_connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


# ── FastAPI Dependencies ──────────────────────────────────────────────────────

def get_db():
    """SQLAlchemy session — used by scraper routers."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


async def get_mongo_db():
    """Async MongoDB database — used by auth and student routers."""
    return await MongoDB.get_database()
