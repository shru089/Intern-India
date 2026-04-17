"""
Resume Parser Router
====================
POST /resume/parse          — Upload PDF/DOCX, get structured profile data
POST /resume/parse-and-fill — Parse resume and immediately update the student's profile
"""

import logging
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase

from ..services.resume_parser import ResumeParser
from ..database import get_mongo_db
from ..routers.auth import get_current_user
from ..models.user import UserInDB

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/resume", tags=["Resume Parser"])


@router.post("/parse")
async def parse_resume(file: UploadFile = File(...)):
    """Parse a resume (PDF or DOCX) and return extracted profile data."""
    if file.content_type == "application/pdf":
        result = await ResumeParser.parse_pdf(file)
    elif file.content_type in (
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/msword",
    ):
        result = await ResumeParser.parse_docx(file)
    else:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type. Please upload PDF or DOCX.",
        )

    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])

    return result


@router.post("/parse-and-fill")
async def parse_and_fill_profile(
    file: UploadFile = File(...),
    current_user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_mongo_db),
):
    """
    Parse the uploaded resume with AI and automatically update the
    authenticated student's profile with the extracted skills, domains,
    and experience summary — eliminating onboarding friction.
    """
    if file.content_type == "application/pdf":
        result = await ResumeParser.parse_pdf(file)
    elif file.content_type in (
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/msword",
    ):
        result = await ResumeParser.parse_docx(file)
    else:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type. Please upload PDF or DOCX.",
        )

    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])

    # Build profile patch from extracted data
    profile_patch: dict = {}
    if result.get("skills"):
        profile_patch["skills"] = result["skills"]
    if result.get("suggested_domains"):
        profile_patch["pref_domains"] = result["suggested_domains"]
    if result.get("suggested_locations"):
        profile_patch["pref_locations"] = result["suggested_locations"]
    if result.get("experience_summary"):
        profile_patch["experience_summary"] = result["experience_summary"]
    if result.get("education"):
        profile_patch["education"] = result["education"]

    if profile_patch:
        await db.student_profiles.update_one(
            {"email": current_user.email},
            {"$set": profile_patch},
            upsert=True,
        )

    return {
        "parsed": result,
        "profile_updated": bool(profile_patch),
        "fields_filled": list(profile_patch.keys()),
    }