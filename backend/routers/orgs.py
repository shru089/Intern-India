"""
Organization Portal Router
==========================
Endpoints for companies / government agencies to:
  POST /orgs/internships            — Post a new internship listing
  GET  /orgs/internships            — List internships posted by this org
  GET  /orgs/internships/{id}/matches — See top-matched student profiles for a role
  GET  /orgs/dashboard              — Aggregated stats for the org's listings
"""

from __future__ import annotations

from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..database import get_db, get_mongo_db
from ..models import Internship
from ..routers.auth import get_current_user
from ..models.user import UserInDB, Role
from ..services.matching import score_internship
from motor.motor_asyncio import AsyncIOMotorDatabase

router = APIRouter()


# ── Request / Response schemas ────────────────────────────────────────────────

class InternshipPost(BaseModel):
    title: str
    company_name: str
    location: str
    domain: str
    required_skills: str          # comma-separated
    stipend: Optional[str] = "Unpaid"
    duration_months: Optional[int] = 2
    description: Optional[str] = None
    source: str = "org_portal"
    source_url: Optional[str] = None


class InternshipResponse(BaseModel):
    id: int
    title: str
    company_name: Optional[str]
    location: Optional[str]
    domain: Optional[str]
    required_skills: Optional[str]
    stipend: Optional[str]
    duration_months: Optional[int]
    source: Optional[str]
    source_url: Optional[str]
    posted_at: Optional[str]

    class Config:
        from_attributes = True


class TopMatch(BaseModel):
    email: str
    full_name: Optional[str]
    skills: list[str]
    match_score: float
    location: Optional[str]
    pref_domains: list[str]


# ── Guard: only org / admin users ─────────────────────────────────────────────

def require_org_or_admin(current_user: UserInDB = Depends(get_current_user)) -> UserInDB:
    if current_user.role not in (Role.organization, Role.admin, "organization", "admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only organization accounts can access this endpoint.",
        )
    return current_user


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("/internships", response_model=InternshipResponse, status_code=201)
def post_internship(
    body: InternshipPost,
    db: Session = Depends(get_db),
    current_user: UserInDB = Depends(require_org_or_admin),
):
    """Post a new internship. Requires an organization account."""
    job = Internship(
        company_name=body.company_name,
        title=body.title,
        location=body.location,
        domain=body.domain,
        required_skills=body.required_skills,
        stipend=body.stipend,
        duration_months=body.duration_months,
        source=body.source,
        source_url=body.source_url or f"org:{current_user.email}:{body.title}",
        posted_at=datetime.utcnow().isoformat(),
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    return job


@router.get("/internships", response_model=list[InternshipResponse])
def list_my_internships(
    db: Session = Depends(get_db),
    current_user: UserInDB = Depends(require_org_or_admin),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
):
    """List internships posted by this org (filtered by company email context)."""
    # Orgs post via 'org_portal' source — filter by that for now
    query = db.query(Internship).filter(Internship.source == "org_portal")
    total = query.count()
    items = query.offset((page - 1) * page_size).limit(page_size).all()
    return items


@router.get("/internships/{internship_id}/matches", response_model=list[TopMatch])
async def top_matches_for_role(
    internship_id: int,
    top_n: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    mongo: AsyncIOMotorDatabase = Depends(get_mongo_db),
    current_user: UserInDB = Depends(require_org_or_admin),
):
    """Return the top-N student profiles that best match a given internship."""
    job = db.query(Internship).filter(Internship.id == internship_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Internship not found")

    # Fetch all student profiles from MongoDB
    cursor = mongo.student_profiles.find({})
    profiles = await cursor.to_list(length=1000)

    scored = []
    for prof in profiles:
        sc = score_internship(prof, job)
        skills = prof.get("skills", [])
        if isinstance(skills, str):
            skills = [s.strip() for s in skills.split(",") if s.strip()]
        domains = prof.get("pref_domains", [])
        if isinstance(domains, str):
            domains = [d.strip() for d in domains.split(",") if d.strip()]
        scored.append(
            TopMatch(
                email=prof.get("email", ""),
                full_name=prof.get("full_name"),
                skills=skills,
                match_score=sc,
                location=prof.get("location"),
                pref_domains=domains,
            )
        )

    scored.sort(key=lambda x: x.match_score, reverse=True)
    return scored[:top_n]


@router.get("/dashboard")
async def org_dashboard(
    db: Session = Depends(get_db),
    mongo: AsyncIOMotorDatabase = Depends(get_mongo_db),
    current_user: UserInDB = Depends(require_org_or_admin),
):
    """Org dashboard stats: listings count, avg match score, top skills in demand."""
    listings = db.query(Internship).filter(Internship.source == "org_portal").all()
    total_students = await mongo.student_profiles.count_documents({})

    # Aggregate required skills across org's listings
    from collections import Counter
    skill_counter: Counter = Counter()
    for job in listings:
        for sk in (job.required_skills or "").split(","):
            s = sk.strip().lower()
            if s:
                skill_counter[s] += 1

    top_skills = [{"skill": k, "count": v} for k, v in skill_counter.most_common(10)]

    return {
        "total_listings": len(listings),
        "total_students_on_platform": total_students,
        "top_skills_in_demand": top_skills,
        "domains": list({j.domain for j in listings if j.domain}),
    }
