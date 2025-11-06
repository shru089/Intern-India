from pydantic import BaseModel


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
    match_score: float


class RecommendationList(BaseModel):
    items: list[Recommendation]


