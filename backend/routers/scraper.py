"""
Scraper router — exposes endpoints to trigger and monitor scraping.
POST /scraper/trigger   - Run all scrapers once (background task)
GET  /scraper/status    - Latest scrape stats
"""

import asyncio
import logging
from datetime import datetime
from fastapi import APIRouter, BackgroundTasks, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import text

from database import get_db, SessionLocal
from scrapers.internshala import InternshalaScraper
from scrapers.aicte import AICTEScraper
from scrapers.engine import ScraperEngine

logger = logging.getLogger(__name__)
router = APIRouter()

_last_run: dict = {
    "started_at": None,
    "finished_at": None,
    "added": 0,
    "status": "idle",
    "error": None,
}


def _do_scrape(use_async: bool = False):
    """
    Background task to run scrapers.
    Creates its own database session since FastAPI closes the injected session
    when the request completes.
    """
    global _last_run
    _last_run["started_at"] = datetime.utcnow().isoformat()
    _last_run["status"] = "running"
    _last_run["error"] = None

    db = SessionLocal()
    try:
        before = db.execute(text("SELECT COUNT(*) FROM internships")).scalar()

        engine = ScraperEngine(db)
        engine.add_scraper(InternshalaScraper(pages=3, max_retries=3))
        engine.add_scraper(
            InternshalaScraper(pages=2, work_from_home=True, max_retries=3)
        )
        engine.add_scraper(AICTEScraper(pages=2, max_retries=3))

        if use_async:
            # Run async scraping
            asyncio.run(engine.run_all_async())
        else:
            engine.run_all()

        after = db.execute(text("SELECT COUNT(*) FROM internships")).scalar()
        added = after - before

        _last_run["finished_at"] = datetime.utcnow().isoformat()
        _last_run["added"] = added
        _last_run["status"] = "done"
        logger.info(f"Scrape complete — {added} new internships added.")

    except Exception as e:
        _last_run["status"] = "error"
        _last_run["error"] = str(e)
        _last_run["finished_at"] = datetime.utcnow().isoformat()
        logger.error(f"Scrape failed: {e}", exc_info=True)
    finally:
        db.close()


@router.post("/trigger", summary="Trigger a scrape run in the background")
async def trigger_scrape(
    background_tasks: BackgroundTasks,
    use_async: bool = Query(
        False, description="Use async scraping for better concurrent performance"
    ),
):
    if _last_run["status"] == "running":
        return {"message": "A scrape is already in progress.", "status": "running"}

    background_tasks.add_task(_do_scrape, use_async)
    mode = "async" if use_async else "sync"
    return {
        "message": f"Scrape triggered in {mode} mode.",
        "status": "started",
        "mode": mode,
    }


@router.get("/status", summary="Get last scrape run status")
async def scrape_status():
    return _last_run
