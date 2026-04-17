"""
Students router.

Endpoints
---------
POST /students/profile         — Create/update the logged-in student's profile
GET  /students/recommendations — Get AI-ranked internship recommendations
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from motor.motor_asyncio import AsyncIOMotorDatabase

from ..database import get_db, get_mongo_db
from ..models import Internship
from ..schemas.student import StudentProfileCreate, RecommendationList, Recommendation
from ..routers.auth import get_current_user
from ..models.user import UserInDB
from ..services.matching import score_internship

router = APIRouter()


# ── Profile ───────────────────────────────────────────────────────────────────

@router.post("/profile")
async def create_or_update_profile(
    body: StudentProfileCreate,
    current_user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_mongo_db),
):
    """Create or update the authenticated student's profile in MongoDB."""
    profile_doc = {
        "email": current_user.email,
        "department": body.department,
        "skills": body.skills,
        "gpa": body.gpa,
        "location": body.location,
        "pref_domains": body.pref_domains,
        "pref_locations": body.pref_locations,
    }
    await db.student_profiles.update_one(
        {"email": current_user.email},
        {"$set": profile_doc},
        upsert=True,
    )
    return {"ok": True}


@router.get("/profile")
async def get_profile(
    current_user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_mongo_db),
):
    """Return the authenticated student's profile."""
    prof = await db.student_profiles.find_one({"email": current_user.email})
    if not prof:
        raise HTTPException(status_code=404, detail="Profile not found — please complete onboarding.")
    prof["_id"] = str(prof["_id"])
    return prof


# ── Recommendations ───────────────────────────────────────────────────────────

@router.get("/recommendations", response_model=RecommendationList)
async def recommendations(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    current_user: UserInDB = Depends(get_current_user),
    mongo: AsyncIOMotorDatabase = Depends(get_mongo_db),
    sqlite: Session = Depends(get_db),
):
    """
    Returns internship recommendations for the authenticated user,
    ranked by the AI match score.  Falls back gracefully if no profile exists.
    """
    prof = await mongo.student_profiles.find_one({"email": current_user.email})
    if not prof:
        return RecommendationList(items=[], total=0, page=page, page_size=page_size)

    all_internships = sqlite.query(Internship).all()

    scored_items = []
    for job in all_internships:
        match_score = score_internship(prof, job)
        scored_items.append(
            Recommendation(
                internship_id=job.id,
                title=job.title,
                organization=job.company_name,
                location=job.location,
                source=job.source,
                source_url=job.source_url,
                domain=job.domain,
                stipend=job.stipend,
                duration_months=job.duration_months,
                match_score=match_score,
            )
        )

    scored_items.sort(key=lambda x: x.match_score, reverse=True)

    total = len(scored_items)
    start = (page - 1) * page_size
    end = start + page_size
    paginated_items = scored_items[start:end]

    return RecommendationList(
        items=paginated_items, total=total, page=page, page_size=page_size
    )
