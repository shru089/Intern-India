"""
Scheduler — runs all scrapers on a cron schedule and pushes Telegram alerts.
Run this standalone:  python -m backend.scrapers.scheduler
Or import and call:   run_once()
"""

import os
import logging
import time
import schedule
from datetime import datetime
from sqlalchemy.orm import Session

from ..database import SessionLocal
from ..utils.notifications import send_telegram_alert
from .internshala import InternshalaScraper
from .engine import ScraperEngine

logger = logging.getLogger(__name__)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
)

# ── Config ──────────────────────────────────────────────────────────────────
SCRAPE_INTERVAL_MINUTES = int(os.getenv("SCRAPE_INTERVAL_MINUTES", "60"))
INTERNSHALA_PAGES = int(os.getenv("INTERNSHALA_PAGES", "3"))


def _build_engine(db: Session) -> ScraperEngine:
    """Attach all scrapers to the engine."""
    engine = ScraperEngine(db)

    # Internshala — general + WFH
    engine.add_scraper(InternshalaScraper(pages=INTERNSHALA_PAGES))
    engine.add_scraper(InternshalaScraper(pages=2, work_from_home=True))

    # TODO: Add more scrapers here as we build them
    # engine.add_scraper(FounditScraper(pages=2))
    # engine.add_scraper(MyGovScraper())

    return engine


def run_once():
    """Run all scrapers once, save new results, send Telegram alerts."""
    logger.info("▶  Starting scrape run...")
    start = datetime.utcnow()

    db: Session = SessionLocal()
    try:
        initial_count = db.execute("SELECT COUNT(*) FROM internships").scalar()
        engine = _build_engine(db)
        engine.run_all()
        new_count = db.execute("SELECT COUNT(*) FROM internships").scalar()

        added = new_count - initial_count
        elapsed = (datetime.utcnow() - start).seconds

        logger.info(f"✅  Done. {added} new internships added in {elapsed}s.")

        if added > 0:
            msg = (
                f"🚀 *Internship Radar Alert*\n\n"
                f"Found *{added} new internships* just now!\n"
                f"📌 Total in database: *{new_count}*\n"
                f"⏱ Scraped in {elapsed}s\n\n"
                f"👉 [Browse Now](http://localhost:5173/find-internships)"
            )
            send_telegram_alert(msg)

    except Exception as e:
        logger.error(f"Scrape run failed: {e}", exc_info=True)
        send_telegram_alert(f"❌ *Scraper Error*\n\n```{str(e)[:300]}```")
    finally:
        db.close()


def start_scheduler():
    """Start the recurring scheduler."""
    logger.info(f"🕐  Scheduler started — running every {SCRAPE_INTERVAL_MINUTES} min.")

    # Run once immediately on start
    run_once()

    # Then on schedule
    schedule.every(SCRAPE_INTERVAL_MINUTES).minutes.do(run_once)

    while True:
        schedule.run_pending()
        time.sleep(30)


if __name__ == "__main__":
    start_scheduler()
