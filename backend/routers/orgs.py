from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Internship
from ..mongo import has_mongo, db

router = APIRouter()


@router.post("/internships")
async def create_internship(job: dict, session: Session = Depends(get_db)):
    if has_mongo():
        database = db()
        res = await database.internships.insert_one(job)
        return {"id": str(res.inserted_id)}
    item = Internship(
        org_id=job.get("org_id", 1),
        title=job.get("title", "Intern"),
        location=job.get("location", "Remote"),
        duration_months=job.get("duration_months", 3),
        stipend=job.get("stipend", 0),
        required_skills=",".join(job.get("required_skills", [])),
        domain=job.get("domain", "General"),
    )
    session.add(item)
    session.commit()
    session.refresh(item)
    return {"id": item.id}


