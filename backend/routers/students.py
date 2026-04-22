"""
Students router.

Endpoints
---------
POST /students/profile         — Create/update the logged-in student's profile
GET  /students/recommendations — Get AI-ranked internship recommendations
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import get_db
from models import Internship, StudentProfile, Application, UserSQL
from schemas.student import StudentProfileCreate, RecommendationList, Recommendation
from routers.auth import get_current_user

from services.matching import score_internship

router = APIRouter()


@router.get("/dashboard")
async def student_dashboard(
    current_user: UserSQL = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Returns summary stats for the student dashboard."""
    # Applications
    app_count = db.query(Application).filter(Application.student_email == current_user.email).count()
    recent_apps = db.query(Application).filter(Application.student_email == current_user.email).order_by(Application.applied_at.desc()).limit(2).all()
    
    # Recommendations (simplified top matches)
    prof = db.query(StudentProfile).filter(StudentProfile.user_email == current_user.email).first()
    matches_count = db.query(Internship).count() if prof else 0
    
    return {
        "stats": {
            "applications_count": app_count,
            "matches_count": matches_count,
            "profile_completion": getattr(prof, "profile_completion", 70) if prof else 0
        },
        "recent_applications": [
            {
                "id": app.id,
                "title": db.query(Internship).get(app.internship_id).title if db.query(Internship).get(app.internship_id) else "Unknown",
                "status": app.status,
                "applied_at": app.applied_at
            }
            for app in recent_apps
        ]
    }


# ── Profile ───────────────────────────────────────────────────────────────────


@router.put("/profile")
async def create_or_update_profile(
    body: StudentProfileCreate,
    current_user: UserSQL = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create or update the authenticated student's profile."""
    profile = db.query(StudentProfile).filter(StudentProfile.user_email == current_user.email).first()
    
    # Convert lists to comma-separated strings for SQL storage
    skills_str = ",".join(body.skills) if isinstance(body.skills, list) else body.skills
    domains_str = ",".join(body.pref_domains) if isinstance(body.pref_domains, list) else body.pref_domains
    locations_str = ",".join(body.pref_locations) if isinstance(body.pref_locations, list) else body.pref_locations

    if profile:
        profile.department = body.department
        profile.skills = skills_str
        profile.gpa = body.gpa
        profile.location = body.location
        profile.pref_domains = domains_str
        profile.pref_locations = locations_str
        profile.is_rural = body.is_rural
    else:
        profile = StudentProfile(
            user_email=current_user.email,
            department=body.department,
            skills=skills_str,
            gpa=body.gpa,
            location=body.location,
            pref_domains=domains_str,
            pref_locations=locations_str,
            is_rural=body.is_rural
        )
        db.add(profile)
    
    db.commit()
    return {"ok": True}



@router.get("/profile")
async def get_profile(
    current_user: UserSQL = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return the authenticated student's profile."""
    prof = db.query(StudentProfile).filter(StudentProfile.user_email == current_user.email).first()
    if not prof:
        raise HTTPException(
            status_code=404, detail="Profile not found — please complete onboarding."
        )
    return prof


# ── Recommendations ───────────────────────────────────────────────────────────


@router.get("/recommendations", response_model=RecommendationList)
async def recommendations(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    current_user: UserSQL = Depends(get_current_user),
    sqlite: Session = Depends(get_db),
):
    """
    Returns internship recommendations for the authenticated user,
    ranked by the AI match score.  Falls back gracefully if no profile exists.
    """
    prof = sqlite.query(StudentProfile).filter(StudentProfile.user_email == current_user.email).first()
    if not prof:
        return RecommendationList(items=[], total=0, page=page, page_size=page_size)
    
    # AI Score requires a dict-like object or a model with specific attributes
    # Convert StudentProfile to dict for the matching service if needed
    prof_dict = {
        "skills": prof.skills,
        "pref_domains": prof.pref_domains,
        "pref_locations": prof.pref_locations,
        "is_rural": prof.is_rural
    }

    all_internships = sqlite.query(Internship).all()

    scored_items = []
    for job in all_internships:
        match_score = score_internship(prof_dict, job)
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


# ── Search ─────────────────────────────────────────────────────────────────────


@router.get("/search")
def search_internships(
    location: str = Query(None),
    domain: str = Query(None),
    source: str = Query(None),
    is_government: bool = Query(None),
    rural_quota: bool = Query(None),
    stipend_min: int = Query(None),
    stipend_max: int = Query(None),
    db: Session = Depends(get_db),
):
    """
    Search internships with optional filters.
    Prioritizes government and rural quota internships in results.
    """
    query = db.query(Internship)

    if location:
        query = query.filter(Internship.location.ilike(f"%{location}%"))
    if domain:
        query = query.filter(Internship.domain.ilike(f"%{domain}%"))
    if source:
        query = query.filter(Internship.source == source)
    if is_government is not None:
        query = query.filter(Internship.is_government == is_government)
    if rural_quota is not None:
        query = query.filter(Internship.rural_quota == rural_quota)
    if stipend_min is not None:
        # Assuming stipend is stored as string like "10000-15000", parse min
        # For simplicity, filter if stipend contains numbers >= min
        pass  # TODO: Implement stipend filtering
    if stipend_max is not None:
        pass  # TODO: Implement stipend filtering

    # Order by government first, then rural quota
    query = query.order_by(
        Internship.is_government.desc(),
        Internship.rural_quota.desc(),
        Internship.id.desc(),
    )

    results = query.all()
    return [
        {
            "id": job.id,
            "title": job.title,
            "company_name": job.company_name,
            "location": job.location,
            "domain": job.domain,
            "source": job.source,
            "source_url": job.source_url,
            "stipend": job.stipend,
            "duration_months": job.duration_months,
            "is_government": job.is_government,
            "rural_quota": job.rural_quota,
        }
        for job in results
    ]
