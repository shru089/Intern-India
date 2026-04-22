"""
Application Router - Handle internship applications
POST /students/apply/{internship_id} - Apply for internship
GET /students/applications - Get user's applications
PUT /students/applications/{id} - Update application status
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from ..database import get_db
from ..models import Application, Internship, User
from ..schemas.student import ApplicationCreate, ApplicationResponse, ApplicationList

router = APIRouter(prefix="/students", tags=["Applications"])


@router.post("/apply/{internship_id}", response_model=ApplicationResponse)
def apply_for_internship(
    internship_id: int,
    apply_method: str = "easy_apply",
    db: Session = Depends(get_db),
    current_user: User = None  # Will be replaced with actual auth
):
    # Use user_id from auth or default to 1 for now
    user_id = current_user.id if current_user else 1
    
    # Check if internship exists
    internship = db.query(Internship).filter(Internship.id == internship_id).first()
    if not internship:
        raise HTTPException(status_code=404, detail="Internship not found")
    
    # Check if already applied
    existing = db.query(Application).filter(
        Application.student_id == user_id,
        Application.internship_id == internship_id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Already applied to this internship")
    
    # Create application
    application = Application(
        student_id=user_id,
        internship_id=internship_id,
        status="applied",
        apply_method=apply_method,
        applied_at=datetime.utcnow()
    )
    db.add(application)
    db.commit()
    db.refresh(application)
    
    return application


@router.get("/applications", response_model=ApplicationList)
def get_my_applications(
    status: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = None
):
    user_id = current_user.id if current_user else 1
    
    query = db.query(Application).filter(Application.student_id == user_id)
    
    if status:
        query = query.filter(Application.status == status)
    
    total = query.count()
    applications = query.offset((page - 1) * page_size).limit(page_size).all()
    
    return ApplicationList(
        items=applications,
        total=total,
        page=page,
        page_size=page_size
    )


@router.get("/applications/{app_id}", response_model=ApplicationResponse)
def get_application(
    app_id: int,
    db: Session = Depends(get_db),
    current_user: User = None
):
    user_id = current_user.id if current_user else 1
    
    application = db.query(Application).filter(
        Application.id == app_id,
        Application.student_id == user_id
    ).first()
    
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    return application