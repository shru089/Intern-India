"""
Application Router
==================
POST /students/apply/{internship_id}   — Apply for internship
GET  /students/applications            — Get user's applications
GET  /students/applications/{id}       — Get a single application
"""

from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Application, Internship, UserSQL
from ..routers.auth import get_current_user

from ..schemas.student import ApplicationCreate, ApplicationResponse, ApplicationList

router = APIRouter(tags=["Applications"])


@router.post("/apply/{internship_id}", response_model=ApplicationResponse)
def apply_for_internship(
    internship_id: int,
    apply_method: str = "easy_apply",
    db: Session = Depends(get_db),
    current_user: UserSQL = Depends(get_current_user),
):
    """Apply for an internship — tracks the application for the authenticated user."""
    internship = db.query(Internship).filter(Internship.id == internship_id).first()
    if not internship:
        raise HTTPException(status_code=404, detail="Internship not found")

    # Use str(email) as the student identifier stored in student_id via hash
    # For compatibility with the integer FK, we use a hash-based approach
    # or rely on the email as the primary key in a future migration.
    # For now we store the user's MongoDB object-id string hash as an int.
    uid_int = abs(hash(current_user.email)) % (10**9)

    existing = (
        db.query(Application)
        .filter(
            Application.student_id == uid_int,
            Application.internship_id == internship_id,
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400, detail="Already applied to this internship"
        )

    application = Application(
        student_id=uid_int,
        student_email=current_user.email,
        internship_id=internship_id,
        status="applied",
        apply_method=apply_method,
        applied_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
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
    current_user: UserSQL = Depends(get_current_user),
):
    """Get all applications for the authenticated user."""
    uid_int = abs(hash(current_user.email)) % (10**9)
    query = db.query(Application).filter(Application.student_id == uid_int)
    if status:
        query = query.filter(Application.status == status)

    total = query.count()
    applications = query.offset((page - 1) * page_size).limit(page_size).all()

    return ApplicationList(
        items=applications, total=total, page=page, page_size=page_size
    )


@router.get("/applications/{app_id}", response_model=ApplicationResponse)
def get_application(
    app_id: int,
    db: Session = Depends(get_db),
    current_user: UserSQL = Depends(get_current_user),
):
    uid_int = abs(hash(current_user.email)) % (10**9)
    application = (
        db.query(Application)
        .filter(
            Application.id == app_id,
            Application.student_id == uid_int,
        )
        .first()
    )

    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    return application
