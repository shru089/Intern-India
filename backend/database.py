import os
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import MongoClient
from typing import Optional

from sqlalchemy import create_all, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# ── MongoDB Setup ──────────────────────────────────────────────────────────
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
    def get_sync_database(cls):
        sync_client = MongoClient(MONGODB_URI)
        return sync_client[DB_NAME]
    
    @classmethod
    async def close_connection(cls):
        if cls.client:
            cls.client.close()
            cls.client = None

# ── SQLAlchemy Setup (for Scraper & Main DB) ──────────────────────────────
# We use SQLite by default for simplicity during testing
SQLALCH_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./intern_india.db")

engine = create_engine(
    SQLALCH_DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in SQLALCH_DATABASE_URL else {}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# ── Dependencies ──────────────────────────────────────────────────────────

# FastAPI dependency for SQLAlchemy session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Dependency to get async MongoDB database
async def get_mongo_db():
    return await MongoDB.get_database()

# Dependency to get sync MongoDB database
def get_sync_mongo_db():
    return MongoDB.get_sync_database()
