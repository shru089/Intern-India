"""
User model — Pydantic v2 compatible.

Changes from v1:
- `__get_validators__` → `__get_pydantic_core_schema__`
- `class Config` → `model_config = ConfigDict(...)`
- `allow_population_by_field_name` → `populate_by_name`
- `json_encoders` moved inside `model_config`
"""

from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Optional, Annotated, Any

from bson import ObjectId
from pydantic import BaseModel, EmailStr, Field, GetCoreSchemaHandler
from pydantic import model_validator
from pydantic_core import core_schema
from pydantic import ConfigDict


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
    student = "student"
    organization = "organization"
    admin = "admin"


# ── Base config shared by all user models ─────────────────────────────────────

_user_config = ConfigDict(
    use_enum_values=True,
    populate_by_name=True,
    arbitrary_types_allowed=True,
)


# ── Pydantic models ───────────────────────────────────────────────────────────

class UserBase(BaseModel):
    model_config = _user_config

    email: EmailStr
    full_name: Optional[str] = None
    role: Role = Role.student
    is_active: bool = True
    is_superuser: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class UserCreate(UserBase):
    password: str


class UserInDB(UserBase):
    id: PyObjectId = Field(default_factory=lambda: PyObjectId(str(ObjectId())), alias="_id")
    hashed_password: str

    model_config = ConfigDict(
        **_user_config,
        populate_by_name=True,
    )


class User(UserBase):
    id: PyObjectId = Field(default_factory=lambda: PyObjectId(str(ObjectId())), alias="_id")

    model_config = ConfigDict(
        **_user_config,
        populate_by_name=True,
    )
