"""
AICTE Internship Portal Scraper - Legal Government Source
Source: https://internship.aicte-india.org
"""

import logging
from datetime import datetime
from bs4 import BeautifulSoup
from typing import List, Dict, Any

from .base import BaseScraper

logger = logging.getLogger(__name__)

BASE_URL = "https://internship.aicte-india.org"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
}


class AICTEScraper(BaseScraper):
    """Scrapes AICTE National Internship Portal - Government source, fully legal"""

    def __init__(
        self, pages: int = 3, delay_range: tuple = (3, 6), max_retries: int = 3
    ):
        super().__init__(
            source_name="aicte", max_retries=max_retries, delay_range=delay_range
        )
        self.pages = pages

    def _fetch_page(self, url: str) -> BeautifulSoup | None:
        html = self.fetch_with_retry(url, HEADERS)
        if html:
            return BeautifulSoup(html, "html.parser")
        return None

    def _parse_internship(self, card) -> Dict[str, Any] | None:
        try:
            title_elem = card.find("h3") or card.find("h4")
            title = title_elem.get_text(strip=True) if title_elem else "Unknown"

            company_elem = card.find("p") or card.find(class_="company")
            company = (
                company_elem.get_text(strip=True) if company_elem else "AICTE Verified"
            )

            location_elem = card.find(class_="location") or card.find(
                string=lambda t: t and "Pan India" in t
            )
            location = (
                location_elem.get_text(strip=True) if location_elem else "Pan India"
            )

            stipend_elem = card.find(string=lambda t: t and "Stipend" in t)
            stipend = "Not Specified"
            if stipend_elem:
                parent = stipend_elem.parent
                if parent:
                    stipend = parent.get_text(strip=True).replace("Stipend", "").strip()

            # Extract link
            link_elem = card.find("a", href=True)
            apply_url = (
                f"{BASE_URL}{link_elem['href']}"
                if link_elem and link_elem["href"].startswith("/")
                else link_elem["href"]
                if link_elem
                else ""
            )

            return {
                "id": f"aicte_{hash(title + company) % 1000000}",
                "title": title,
                "company": company,
                "location": location,
                "stipend": stipend,
                "duration": "Variable",
                "url": apply_url,
                "posted_at": datetime.utcnow().isoformat(),
                "source": self.source_name,
                "skills": [],
                "is_government": True,  # AICTE is government portal
                "rural_quota": location.lower() in ["rural", "village"]
                or "pan india" in location.lower(),  # Basic heuristic
            }
        except Exception as e:
            logger.warning(f"Failed to parse AICTE card: {e}")
            return None

    def scrape(self) -> List[Dict[str, Any]]:
        all_listings = []

        # AICTE main page has listings - scraping the index page
        url = f"{BASE_URL}/index.php"
        soup = self._fetch_page(url)

        if not soup:
            logger.error("Failed to fetch AICTE page")
            return []

        # Find internship cards - adjust selector based on actual page structure
        cards = soup.select(".internship-list-item, .card, .listing-card")

        for card in cards:
            parsed = self._parse_internship(card)
            if parsed:
                all_listings.append(self.standardize(parsed))

        logger.info(f"AICTE scrape complete. Total: {len(all_listings)} listings.")
        return all_listings
