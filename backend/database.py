import os
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import MongoClient
from typing import Optional

# MongoDB configuration
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/")
DB_NAME = os.getenv("MONGODB_DB", "intern_india")

# Async MongoDB client
class MongoDB:
    client: Optional[AsyncIOMotorClient] = None
    
    @classmethod
    async def get_database(cls):
        if cls.client is None:
            cls.client = AsyncIOMotorClient(MONGODB_URI)
        return cls.client[DB_NAME]
    
    @classmethod
    def get_sync_database(cls):
        """Synchronous database client for use in synchronous contexts"""
        sync_client = MongoClient(MONGODB_URI)
        return sync_client[DB_NAME]
    
    @classmethod
    async def close_connection(cls):
        if cls.client:
            cls.client.close()
            cls.client = None

# Dependency to get async database
def get_db():
    return MongoDB.get_database()

# Dependency to get sync database
def get_sync_db():
    return MongoDB.get_sync_database()


