from __future__ import annotations
from .allocation import score_match, tokenize
from mongo import db


async def allocate_for_student_mongo(user_id: int, persist: bool = True) -> list[dict]:
    database = db()
    prof = await database.student_profiles.find_one({"user_id": user_id})
    if not prof:
        return []
    items: list[dict] = []
    # Fetch all internships
    cursor = database.internships.find({})
    async for job in cursor:
        # Build minimal struct expected by score_match
        class P:
            skills = ",".join(prof.get("skills", [])) if isinstance(prof.get("skills"), list) else prof.get("skills", "")
            gpa = prof.get("gpa", 0.0)
            pref_domains = ",".join(prof.get("pref_domains", [])) if isinstance(prof.get("pref_domains"), list) else prof.get("pref_domains", "")
            pref_locations = ",".join(prof.get("pref_locations", [])) if isinstance(prof.get("pref_locations"), list) else prof.get("pref_locations", "")

        class J:
            required_skills = ",".join(job.get("required_skills", [])) if isinstance(job.get("required_skills"), list) else job.get("required_skills", "")
            domain = job.get("domain")
            location = job.get("location")

        score = score_match(P, J)  # reuse same scoring
        items.append({
            "internship_id": int(job.get("_id").__hash__() & 0xfffffff),
            "title": job.get("title"),
            "domain": job.get("domain"),
            "location": job.get("location"),
            "match_score": score,
        })
    items.sort(key=lambda x: x["match_score"], reverse=True)
    if persist:
        await database.allocations.delete_many({"user_id": user_id})
        await database.allocations.insert_many([{**it, "user_id": user_id} for it in items[:20]])
    return items


