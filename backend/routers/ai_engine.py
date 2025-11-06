from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..services.chatbot import query_gemini
from ..services.allocation import allocate_for_student, run_global_allocation
from ..services.career_insights import summarize_local, enrich_with_gemini
from ..utils.security import require_admin

router = APIRouter()


@router.post("/chatbot/query")
async def chatbot_query(body: dict):
    prompt: str = body.get("message", "")
    if not prompt:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Message cannot be empty")
    answer = await query_gemini(prompt)
    return {"answer": answer}


@router.get("/insights")
async def career_insights(user_id: int, db: Session = Depends(get_db)):
    base = summarize_local(db, user_id)
    enriched = await enrich_with_gemini(base)
    return enriched


@router.post("/recommendations")
def get_recommendations(user_id: int, db: Session = Depends(get_db)):
    """Gets personalized internship recommendations for a single student."""
    results = allocate_for_student(user_id, db, persist=True)
    return {"items": results}


@router.post("/run-allocation", status_code=status.HTTP_200_OK)
def trigger_global_allocation(db: Session = Depends(get_db), _=Depends(require_admin)):
    """Triggers the global, fair allocation process for all students and internships."""
    # Note: This endpoint should be protected and only accessible by an admin.
    result = run_global_allocation(db)
    if result.get("status") == "skipped":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=result.get("message"))
    return result


