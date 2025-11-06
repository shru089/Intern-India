from fastapi import APIRouter

router = APIRouter()


@router.get("/stats")
def stats():
    return {"users": 0, "internships": 0, "allocations": 0}


