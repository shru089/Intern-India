import logging
from typing import List
from sqlalchemy.orm import Session
from ..models import Internship
from .base import BaseScraper

logger = logging.getLogger(__name__)

class ScraperEngine:
    def __init__(self, db: Session):
        self.db = db
        self.scrapers: List[BaseScraper] = []

    def add_scraper(self, scraper: BaseScraper):
        self.scrapers.append(scraper)

    def run_all(self):
        for scraper in self.scrapers:
            logger.info(f"Running scraper: {scraper.source_name}")
            try:
                listings = scraper.scrape()
                self._process_listings(listings)
            except Exception as e:
                logger.error(f"Error running scraper {scraper.source_name}: {e}")

    def _process_listings(self, listings: List[dict]):
        new_count = 0
        for data in listings:
            # Deduplication: check if source_url or external_id exists
            existing = self.db.query(Internship).filter(
                (Internship.source_url == data['url']) | 
                (Internship.external_id == data['id'])
            ).first()

            if not existing:
                internship = Internship(
                    title=data['title'],
                    company_name=data['company'],
                    location=data.get('location'),
                    stipend=str(data.get('stipend', 'Not Specified')),
                    duration_months=data.get('duration'),
                    required_skills=",".join(data.get('skills', [])),
                    source=data['source'],
                    source_url=data['url'],
                    external_id=data['id'],
                    posted_at=data.get('posted_at')
                )
                self.db.add(internship)
                new_count += 1
        
        self.db.commit()
        logger.info(f"Saved {new_count} new internships.")
