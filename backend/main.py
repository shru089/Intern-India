from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import Base, engine
from routers import auth, students, orgs, admin, ai_engine

app = FastAPI(title="Intern-India API", version="0.1.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(students.router, prefix="/students", tags=["students"])
app.include_router(orgs.router, prefix="/orgs", tags=["orgs"])
app.include_router(admin.router, prefix="/admin", tags=["admin"])
app.include_router(ai_engine.router, prefix="/ai", tags=["ai"]) 

@app.get("/")
def health():
    return {"status": "ok"}


