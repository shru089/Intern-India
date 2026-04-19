import os
from fastapi import FastAPI, Depends, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional
from sqlalchemy import text
import logging
import traceback
from datetime import datetime

from backend.database import get_db
from backend.routers import auth, students, orgs, admin, ai_engine, scraper, applications, resume, notify

app = FastAPI(
    title="Intern-India API",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ── CORS ──────────────────────────────────────────────────────────────────────
_allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5175").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["X-Total-Count"],
)


# ── Error handlers ────────────────────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {str(exc)}\n{traceback.format_exc()}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal server error"},
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.warning(f"Validation error: {exc.errors()}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": exc.errors(), "body": exc.body},
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
        headers=exc.headers,
    )


# ── Lifecycle ─────────────────────────────────────────────────────────────────
@app.on_event("startup")
async def startup_db_client():
    from backend.database import engine, Base
    import backend.models  # noqa: F401 — registers all models with Base

    Base.metadata.create_all(bind=engine)
    logger.info("SQLAlchemy tables created/verified.")




# ── Security headers ──────────────────────────────────────────────────────────
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    # Relaxed CSP so the Swagger UI / frontend assets work
    response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
    return response


# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(students.router, prefix="/students", tags=["Students"], dependencies=[Depends(auth.get_current_user)])
app.include_router(orgs.router, prefix="/orgs", tags=["Organizations"], dependencies=[Depends(auth.get_current_user)])
app.include_router(admin.router, prefix="/admin", tags=["Admin"], dependencies=[Depends(auth.get_current_user), Depends(auth.require_admin)])
app.include_router(ai_engine.router, prefix="/ai", tags=["AI Services"], dependencies=[Depends(auth.get_current_user)])
app.include_router(scraper.router, prefix="/scraper", tags=["Scraper"], dependencies=[Depends(auth.get_current_user)])
app.include_router(applications.router, prefix="/students", tags=["Applications"], dependencies=[Depends(auth.get_current_user)])
app.include_router(resume.router, tags=["Resume Parser"])
app.include_router(notify.router, prefix="/notify", tags=["Notifications"], dependencies=[Depends(auth.get_current_user)])


# ── Health check ──────────────────────────────────────────────────────────────
class HealthCheckResponse(BaseModel):
    status: str
    database: str
    version: str
    environment: str
    timestamp: str
    error: Optional[str] = None


@app.get(
    "/",
    response_model=HealthCheckResponse,
    summary="Health Check",
    description="Check if the API is running and connected to the database",
)
async def health():
    db_status = "disconnected"
    try:
        from backend.database import engine
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        db_status = "sqlite_connected"
    except Exception as sql_e:
        logger.error(f"Health check — SQL failed: {sql_e}")

    return {
        "status": "ok",
        "database": db_status,
        "version": "0.1.0",
        "environment": os.getenv("ENV", "development"),
        "timestamp": datetime.utcnow().isoformat(),
    }
