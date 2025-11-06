from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import StudentProfile, User, Internship
from ..schemas.student import StudentProfileCreate, RecommendationList, Recommendation

router = APIRouter()


@router.post("/profile")
def create_or_update_profile(body: StudentProfileCreate, user_id: int = 0, db: Session = Depends(get_db)):
    # user_id should be read from JWT in production; prototype uses dummy
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


@router.get("/recommendations", response_model=RecommendationList)
def recommendations(user_id: int = 0, db: Session = Depends(get_db)):
    prof = db.query(StudentProfile).filter(StudentProfile.user_id == user_id).first()
    if not prof:
        return RecommendationList(items=[])
    prof_skills = set([s.strip().lower() for s in (prof.skills or "").split(",") if s])
    items: list[Recommendation] = []
    for job in db.query(Internship).all():
        req = set([s.strip().lower() for s in (job.required_skills or "").split(",") if s])
        overlap = len(prof_skills & req)
        denom = max(len(req), 1)
        skill_score = overlap / denom
        items.append(Recommendation(internship_id=job.id, title=job.title, organization=None, match_score=round(skill_score * 100, 2)))
    items.sort(key=lambda x: x.match_score, reverse=True)
    return RecommendationList(items=items[:10])


