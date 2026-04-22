from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class StudentProfileCreate(BaseModel):
    department: str
    skills: list[str]
    gpa: float
    location: str
    pref_domains: list[str] = []
    pref_locations: list[str] = []


class Recommendation(BaseModel):
    internship_id: int
    title: str
    organization: str | None = None
    location: str | None = None
    source: str | None = None
    source_url: str | None = None
    match_score: float


class RecommendationList(BaseModel):
    items: list[Recommendation]
    total: int = 0
    page: int = 1
    page_size: int = 10


# === New Application Schemas ===

class ApplicationCreate(BaseModel):
    internship_id: int
    apply_method: str = "easy_apply"  # easy_apply, quick_apply, manual


class ApplicationResponse(BaseModel):
    id: int
    student_id: int
    internship_id: int
    status: str
    apply_method: str
    notes: Optional[str] = None
    applied_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class ApplicationList(BaseModel):
    items: list[ApplicationResponse]
    total: int = 0
    page: int = 1
    page_size: int = 10