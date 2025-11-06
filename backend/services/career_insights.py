from __future__ import annotations
from sqlalchemy.orm import Session
from ..models import StudentProfile, Internship, Application
import os
import httpx


def summarize_local(db: Session, user_id: int) -> dict:
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == user_id).first()
    skills = (profile.skills or "").split(",") if profile else []
    domains = (profile.pref_domains or "").split(",") if profile else []
    top_domains = [d.strip() for d in domains if d.strip()] or ["Software", "Analytics"]
    top_skills = [s.strip() for s in skills if s.strip()][:5] or ["Python", "SQL", "React"]
    return {
        "recommended_domains": top_domains[:2],
        "top_skills_to_learn": top_skills[:3],
        "suggested_path": "Focus on building 2 small projects aligned with your preferred domain.",
        "industry_trends": "Demand for cloud and cybersecurity interns increased by 22% this year.",
    }


async def enrich_with_gemini(summary: dict, user_name: str | None = None) -> dict:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return summary
    prompt = (
        "You are a career assistant. Given a student's skills/domains, return 3 bullet recommendations "
        f"for upskilling and domains. Context: {summary}. Keep it concise."
    )
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
    payload = {"contents": [{"parts": [{"text": prompt}]}]}
    async with httpx.AsyncClient(timeout=30) as client:
        r = await client.post(url, json=payload)
        try:
            data = r.json()
            text = data["candidates"][0]["content"]["parts"][0]["text"]
            summary["ai_summary"] = text
            return summary
        except Exception:
            return summary


