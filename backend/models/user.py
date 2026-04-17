"""
User model — Pydantic v2 compatible.
"""

from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Optional, Any

from bson import ObjectId
from pydantic import BaseModel, EmailStr, Field, GetCoreSchemaHandler, ConfigDict
from pydantic_core import core_schema


# ── ObjectId validator for Pydantic v2 ───────────────────────────────────────

class PyObjectId(str):
    """Pydantic-v2-compatible wrapper for MongoDB ObjectIds."""

    @classmethod
    def __get_pydantic_core_schema__(
        cls,
        source_type: Any,
        handler: GetCoreSchemaHandler,
    ) -> core_schema.CoreSchema:
        return core_schema.no_info_plain_validator_function(
            cls.validate,
            serialization=core_schema.plain_serializer_function_ser_schema(str),
        )

    @classmethod
    def validate(cls, v: Any) -> "PyObjectId":
        if isinstance(v, ObjectId):
            return cls(str(v))
        if isinstance(v, str) and ObjectId.is_valid(v):
            return cls(v)
        raise ValueError(f"Invalid ObjectId: {v!r}")


# ── Role enum ─────────────────────────────────────────────────────────────────

class Role(str, Enum):
    student      = "student"
    organization = "organization"
    admin        = "admin"


# ── Pydantic models ───────────────────────────────────────────────────────────

_base_config = ConfigDict(
    use_enum_values=True,
    populate_by_name=True,
    arbitrary_types_allowed=True,
)


class UserBase(BaseModel):
    model_config = _base_config

    email:         EmailStr
    full_name:     Optional[str] = None
    role:          Role = Role.student
    is_active:     bool = True
    is_superuser:  bool = False
    created_at:    datetime = Field(default_factory=datetime.utcnow)
    updated_at:    datetime = Field(default_factory=datetime.utcnow)


class UserCreate(UserBase):
    password: str


class UserInDB(UserBase):
    model_config = _base_config   # reuse — no duplicates

    id:              PyObjectId = Field(default_factory=lambda: PyObjectId(str(ObjectId())), alias="_id")
    hashed_password: str


class User(UserBase):
    model_config = _base_config

    id: PyObjectId = Field(default_factory=lambda: PyObjectId(str(ObjectId())), alias="_id")
