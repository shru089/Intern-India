from __future__ import annotations
from sqlalchemy.orm import Session
from ..models import StudentProfile, Internship, Allocation
import numpy as np
from scipy.optimize import linear_sum_assignment

# Weights per your spec
WEIGHTS = {
    "skills": 0.50,
    "academic": 0.20,
    "domain": 0.15,
    "location": 0.10,
    "availability": 0.05,  # placeholder in prototype
}


def tokenize(csv: str) -> set[str]:
    return set([s.strip().lower() for s in (csv or "").split(",") if s.strip()])


def score_match(profile: StudentProfile, job: Internship) -> float:
    prof_skills = tokenize(profile.skills)
    req_skills = tokenize(job.required_skills)
    skill_overlap = len(prof_skills & req_skills)
    skills_denom = max(len(req_skills), 1)
    skills_score = skill_overlap / skills_denom

    # academic: GPA normalized to 4.0 scale
    academic_score = min(max((profile.gpa or 0.0) / 4.0, 0.0), 1.0)

    # domain relevance
    prof_domains = tokenize(profile.pref_domains)
    domain_score = 1.0 if (job.domain or "").lower() in prof_domains else 0.0

    # location preference
    prof_locs = tokenize(profile.pref_locations)
    location_score = 1.0 if (job.location or "").lower() in prof_locs else 0.0

    # availability: not modeled; assume neutral for prototype
    availability_score = 1.0

    total = (
        WEIGHTS["skills"] * skills_score
        + WEIGHTS["academic"] * academic_score
        + WEIGHTS["domain"] * domain_score
        + WEIGHTS["location"] * location_score
        + WEIGHTS["availability"] * availability_score
    )
    return round(total * 100.0, 2)


def allocate_for_student(user_id: int, db: Session, persist: bool = True) -> list[dict]:
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == user_id).first()
    if not profile:
        return []
    results: list[dict] = []
    for job in db.query(Internship).all():
        score = score_match(profile, job)
        results.append({
            "internship_id": job.id,
            "title": job.title,
            "domain": job.domain,
            "location": job.location,
            "match_score": score,
        })
    results.sort(key=lambda x: x["match_score"], reverse=True)

    if persist:
        db.query(Allocation).filter(Allocation.student_id == profile.id).delete()
        for item in results[:20]:
            db.add(Allocation(student_id=profile.id, internship_id=item["internship_id"], score=item["match_score"]))
        db.commit()
    return results


def run_global_allocation(db: Session) -> dict:
    """
    Performs a global, fair allocation of students to internships using an optimization algorithm.
    """
    students = db.query(StudentProfile).all()
    internships = db.query(Internship).all()

    if not students or not internships:
        return {"status": "skipped", "message": "No students or internships to allocate."}

    num_students = len(students)
    num_internships = len(internships)

    # Create a cost matrix. Since we want to MAXIMIZE the score, we use the negative score.
    cost_matrix = np.zeros((num_students, num_internships))
    for i, student in enumerate(students):
        for j, internship in enumerate(internships):
            score = score_match(student, internship)
            cost_matrix[i, j] = 100 - score  # Using 100 - score as cost

    # Solve the assignment problem using the Hungarian algorithm
    row_ind, col_ind = linear_sum_assignment(cost_matrix)

    # Clear previous allocations and store the new optimal ones
    db.query(Allocation).delete()
    
    allocations_made = 0
    for i in range(len(row_ind)):
        student_idx = row_ind[i]
        internship_idx = col_ind[i]
        
        student = students[student_idx]
        internship = internships[internship_idx]
        
        # The score is the inverse of the cost
        score = 100 - cost_matrix[student_idx, internship_idx]

        db.add(Allocation(
            student_id=student.id,
            internship_id=internship.id,
            score=score
        ))
        allocations_made += 1

    db.commit()

    return {
        "status": "success",
        "allocations_made": allocations_made,
        "total_students": num_students,
        "total_internships": num_internships,
    }


