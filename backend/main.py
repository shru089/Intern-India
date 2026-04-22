from fastapi import FastAPI, Depends, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError, HTTPException
from fastapi.responses import JSONResponse
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel
from typing import Dict, Any, Optional
from sqlalchemy import text
import logging
import traceback

from database import MongoDB, get_db
from routers import auth, students, orgs, admin, ai_engine, scraper
import os

app = FastAPI(
    title="Intern-India API",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["X-Total-Count"],
)


# Error handling middleware
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


# Database connection events
@app.on_event("startup")
async def startup_db_client():
    # Initialize MongoDB connection
    # Note: We try to connect, but don't fail if local mongo isn't running
    # since we are moving towards SQL for the core internship data.
    try:
        await MongoDB.get_database()
        print("Connected to MongoDB")
    except Exception as e:
        print(f"MongoDB not connected (optional): {e}")

    # Initialize SQLAlchemy Tables
    from database import engine, Base
    import models  # Ensure all models are imported so they register with Base

    Base.metadata.create_all(bind=engine)
    print("SQLAlchemy tables created/verified.")


@app.on_event("shutdown")
async def shutdown_db_client():
    await MongoDB.close_connection()
    print("Closed MongoDB connection")


# Security headers middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Content-Security-Policy"] = "default-src 'self'"
    return response


# Include routers with security middleware
app.include_router(
    auth.router,
    prefix="/auth",
    tags=["Authentication"],
    responses={404: {"description": "Not found"}},
)

app.include_router(
    students.router,
    prefix="/students",
    tags=["Students"],
    dependencies=[Depends(auth.get_current_user)],
    responses={401: {"description": "Unauthorized"}},
)

app.include_router(
    orgs.router,
    prefix="/orgs",
    tags=["Organizations"],
    dependencies=[Depends(auth.get_current_user)],
    responses={401: {"description": "Unauthorized"}},
)

app.include_router(
    admin.router,
    prefix="/admin",
    tags=["Admin"],
    dependencies=[Depends(auth.get_current_user), Depends(auth.require_admin)],
    responses={
        401: {"description": "Unauthorized"},
        403: {"description": "Forbidden - Admin access required"},
    },
)

app.include_router(
    ai_engine.router,
    prefix="/ai",
    tags=["AI Services"],
    dependencies=[Depends(auth.get_current_user)],
    responses={401: {"description": "Unauthorized"}},
)

app.include_router(
    scraper.router,
    prefix="/scraper",
    tags=["Scraper"],
    dependencies=[Depends(auth.get_current_user)],
    responses={401: {"description": "Unauthorized"}},
)


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
    responses={
        200: {"description": "API is healthy"},
        503: {"description": "Service unavailable - database connection error"},
    },
)
async def health():
    """
    Health check endpoint that verifies:
    - API is running
    - Database connection is active
    - Environment status
    """
    from datetime import datetime

    db_status = "disconnected"
    try:
        db = await get_db()
        await db.command("ping")
        db_status = "connected"
    except Exception as e:
        logger.warning(f"Health check - MongoDB not available: {str(e)}")

        try:
            from database import engine

            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            db_status = "sqlite_connected"
        except Exception as sql_e:
            logger.error(f"Health check - SQLite also failed: {str(sql_e)}")

    return {
        "status": "ok",
        "database": db_status,
        "version": "0.1.0",
        "environment": os.getenv("ENV", "development"),
        "timestamp": datetime.utcnow().isoformat(),
    }
