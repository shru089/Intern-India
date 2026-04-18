from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class StudentProfileCreate(BaseModel):
    department: str
    skills: List[str]
    gpa: float
    location: str
    pref_domains: List[str] = []
    pref_locations: List[str] = []
    is_rural: bool = False


class Recommendation(BaseModel):
    internship_id: int
    title: str
    organization: Optional[str] = None
    location: Optional[str] = None
    source: Optional[str] = None
    source_url: Optional[str] = None
    domain: Optional[str] = None
    stipend: Optional[str] = None
    duration_months: Optional[int] = None
    match_score: float


class RecommendationList(BaseModel):
    items: List[Recommendation]
    total: int = 0
    page: int = 1
    page_size: int = 10


# === Application Schemas ===


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

    model_config = {"from_attributes": True}


class ApplicationList(BaseModel):
    items: List[ApplicationResponse]
    total: int = 0
    page: int = 1
    page_size: int = 10
