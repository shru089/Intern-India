from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import StudentProfile, User, Internship
from ..schemas.student import StudentProfileCreate, RecommendationList, Recommendation

router = APIRouter()


@router.post("/profile")
def create_or_update_profile(
    body: StudentProfileCreate, user_id: int = 0, db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    prof = db.query(StudentProfile).filter(StudentProfile.user_id == user_id).first()
    skills = ",".join(body.skills)
    domains = ",".join(body.pref_domains)
    locs = ",".join(body.pref_locations)
    if prof:
        prof.department = body.department
        prof.skills = skills
        prof.gpa = body.gpa
        prof.location = body.location
        prof.pref_domains = domains
        prof.pref_locations = locs
    else:
        prof = StudentProfile(
            user_id=user_id,
            department=body.department,
            skills=skills,
            gpa=body.gpa,
            location=body.location,
            pref_domains=domains,
            pref_locations=locs,
        )
        db.add(prof)
    db.commit()
    return {"ok": True}


def calculate_match_score(prof: StudentProfile, job: Internship) -> float:
    """
    Calculate match score based on:
    - Skills overlap (40% weight)
    - Location preference (30% weight)
    - Domain preference (30% weight)
    """
    skill_weight = 0.4
    location_weight = 0.3
    domain_weight = 0.3

    prof_skills = set([s.strip().lower() for s in (prof.skills or "").split(",") if s])
    job_skills = set(
        [s.strip().lower() for s in (job.required_skills or "").split(",") if s]
    )
    skill_overlap = len(prof_skills & job_skills)
    skill_score = skill_overlap / max(len(job_skills), 1)

    prof_locations = set(
        [s.strip().lower() for s in (prof.pref_locations or "").split(",") if s]
    )
    job_location = (job.location or "").lower()
    location_score = 0.0
    if prof_locations:
        for loc in prof_locations:
            if loc in job_location or job_location in loc:
                location_score = 1.0
                break
        if not location_score and prof.location and job_location:
            if prof.location.lower() in job_location:
                location_score = 1.0

    prof_domains = set(
        [s.strip().lower() for s in (prof.pref_domains or "").split(",") if s]
    )
    job_domain = (job.domain or "").lower()
    domain_score = 0.0
    if prof_domains:
        for domain in prof_domains:
            if domain in job_domain or job_domain in domain:
                domain_score = 1.0

    total_score = (
        (skill_score * skill_weight)
        + (location_score * location_weight)
        + (domain_score * domain_weight)
    )
    return round(total_score * 100, 2)


@router.get("/recommendations", response_model=RecommendationList)
def recommendations(
    user_id: int = 0,
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
):
    prof = db.query(StudentProfile).filter(StudentProfile.user_id == user_id).first()
    if not prof:
        return RecommendationList(items=[], total=0, page=page, page_size=page_size)

    all_internships = db.query(Internship).all()

    scored_items = []
    for job in all_internships:
        match_score = calculate_match_score(prof, job)
        scored_items.append(
            Recommendation(
                internship_id=job.id,
                title=job.title,
                organization=job.company_name,
                location=job.location,
                source=job.source,
                source_url=job.source_url,
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
