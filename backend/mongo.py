import os
from pymongo import MongoClient

_client = None


def get_mongo_db():
    global _client
    uri = os.getenv("MONGODB_URI")
    if not uri:
        return None
    if _client is None:
        _client = MongoClient(uri, serverSelectionTimeoutMS=5000)
    db_name = os.getenv("MONGODB_DB", "intern_india")
    return _client[db_name]

import os
from motor.motor_asyncio import AsyncIOMotorClient


MONGO_URL = os.getenv("MONGO_URL")


def has_mongo() -> bool:
    return bool(MONGO_URL)


_client: AsyncIOMotorClient | None = None


def client() -> AsyncIOMotorClient:
    global _client
    if _client is None:
        if not MONGO_URL:
            raise RuntimeError("MONGO_URL not set")
        _client = AsyncIOMotorClient(MONGO_URL)
    return _client


def db():
    return client()[os.getenv("MONGO_DB", "intern_india")] 


