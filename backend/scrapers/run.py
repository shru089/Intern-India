"""
CLI runner — quickly test scrapers without the scheduler.
Usage:
    python -m backend.scrapers.run                  # runs all scrapers once
    python -m backend.scrapers.run --source internshala
    python -m backend.scrapers.run --source internshala --pages 1 --wfh
    python -m backend.scrapers.run --dry-run        # scrape but don't save to DB
"""

import argparse
import logging
import json
from .internshala import InternshalaScraper

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
)
logger = logging.getLogger(__name__)


def main():
    parser = argparse.ArgumentParser(description="Internship Radar — Scraper CLI")
    parser.add_argument("--source", default="internshala", choices=["internshala"], help="Which scraper to run")
    parser.add_argument("--pages", type=int, default=3, help="Number of pages to scrape")
    parser.add_argument("--wfh", action="store_true", help="Work from home listings only")
    parser.add_argument("--category", default=None, help="Category filter e.g. 'computer-science'")
    parser.add_argument("--location", default=None, help="Location filter e.g. 'delhi'")
    parser.add_argument("--dry-run", action="store_true", help="Scrape but print to stdout, don't save to DB")
    args = parser.parse_args()

    if args.source == "internshala":
        scraper = InternshalaScraper(
            pages=args.pages,
            category=args.category,
            location=args.location,
            work_from_home=args.wfh,
        )

    logger.info(f"Running scraper: {args.source} | pages={args.pages} | wfh={args.wfh}")
    results = scraper.scrape()

    if args.dry_run:
        logger.info(f"\n{'='*60}")
        logger.info(f"DRY RUN — {len(results)} listings found (not saved to DB)")
        logger.info(f"{'='*60}\n")
        for i, r in enumerate(results, 1):
            print(f"\n[{i}] {r['title']}")
            print(f"    Company  : {r['company_name']}")
            print(f"    Location : {r['location']}")
            print(f"    Stipend  : {r['stipend']}")
            print(f"    Duration : {r['duration_months']}")
            print(f"    Source   : {r['source']}")
            print(f"    URL      : {r['source_url']}")
    else:
        from ..database import SessionLocal
        from .engine import ScraperEngine
        db = SessionLocal()
        try:
            engine = ScraperEngine(db)
            engine._process_listings([{
                "title": r["title"],
                "company": r["company_name"],
                "location": r["location"],
                "stipend": r["stipend"],
                "duration": r["duration_months"],
                "skills": r.get("required_skills", "").split(","),
                "source": r["source"],
                "url": r["source_url"],
                "id": r["external_id"],
                "posted_at": r.get("posted_at"),
            } for r in results])
            logger.info(f"✅ Saved {len(results)} listings to database.")
        finally:
            db.close()


if __name__ == "__main__":
    main()
