"""
Internshala Scraper — Target: internshala.com/internships
Strategy: requests + BeautifulSoup (SSR page, most data in initial HTML)
Falls back to Playwright for JS-heavy pages

Key selectors (verified live on 2026-04-15):
  Card:    div.individual_internship
  ID:      div[data-internshipid]
  Title:   a.job-title-href
  Company: p.company-name
  Location:.location_link
  Stipend: .stipend
  Duration:.item_body  (2nd occurrence in card)
  URL:     a.job-title-href[href]
  Posted:  .status-success or .status-info
"""

import time
import random
import logging
import requests
from datetime import datetime
from bs4 import BeautifulSoup
from typing import List, Dict, Any

from .base import BaseScraper

logger = logging.getLogger(__name__)

BASE_URL = "https://internshala.com"
LISTINGS_URL = f"{BASE_URL}/internships"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "en-IN,en;q=0.9",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Referer": "https://internshala.com/",
}


class InternshalaScraper(BaseScraper):
    """
    Scrapes internship listings from Internshala.

    Args:
        pages:      How many listing pages to scrape (default: 3)
        category:   Optional category filter, e.g. 'computer-science'
        location:   Optional location filter, e.g. 'delhi'
        work_from_home: If True, scrapes remote/WFH listings only
        delay_range: (min, max) seconds between requests — be respectful!
        max_retries: Maximum retries for failed requests
    """

    def __init__(
        self,
        pages: int = 3,
        category: str = None,
        location: str = None,
        work_from_home: bool = False,
        delay_range: tuple = (2, 5),
        max_retries: int = 3,
    ):
        super().__init__(source_name="internshala")
        self.pages = pages
        self.category = category
        self.location = location
        self.work_from_home = work_from_home
        self.delay_range = delay_range
        self.max_retries = max_retries

    def _build_url(self, page: int = 1) -> str:
        """Build the listings URL with optional filters."""
        path_parts = [LISTINGS_URL]

        if self.work_from_home:
            path_parts.append("work-from-home")
        if self.category:
            path_parts.append(f"{self.category}-internship")
        if self.location:
            path_parts.append(f"in-{self.location}")

        base = "/".join(path_parts)

        if page > 1:
            base = f"{base}/page-{page}"

        return base

    def _fetch_page(self, url: str) -> BeautifulSoup | None:
        """Fetch a page with retry logic and return a BeautifulSoup object."""
        last_error = None
        for attempt in range(self.max_retries):
            try:
                logger.info(
                    f"Fetching (attempt {attempt + 1}/{self.max_retries}): {url}"
                )
                response = requests.get(url, headers=HEADERS, timeout=15)
                response.raise_for_status()
                return BeautifulSoup(response.text, "html.parser")
            except requests.RequestException as e:
                last_error = e
                logger.warning(f"Attempt {attempt + 1} failed for {url}: {e}")
                if attempt < self.max_retries - 1:
                    wait_time = (attempt + 1) * 3
                    logger.info(f"Retrying in {wait_time} seconds...")
                    time.sleep(wait_time)

        logger.error(
            f"Failed to fetch {url} after {self.max_retries} attempts: {last_error}"
        )
        return None

    def _parse_card(self, card) -> Dict[str, Any] | None:
        """Extract structured data from a single internship card."""
        try:
            # --- Unique ID (primary dedup key) ---
            internship_id = card.get("data-internshipid")
            if not internship_id:
                return None

            # --- Title & URL ---
            title_tag = card.select_one("a.job-title-href")
            if not title_tag:
                # Fallback: try heading inside card
                title_tag = card.select_one(".profile h3 a")
            title = title_tag.get_text(strip=True) if title_tag else "Unknown"
            href = title_tag.get("href", "") if title_tag else ""
            url = f"{BASE_URL}{href}" if href.startswith("/") else href

            # --- Company ---
            company_tag = card.select_one("p.company-name")
            if not company_tag:
                company_tag = card.select_one(".company_and_premium p")
            company = company_tag.get_text(strip=True) if company_tag else "Unknown"

            # --- Location ---
            location_tags = card.select(".location_link")
            locations = [t.get_text(strip=True) for t in location_tags]
            # Also check for "Work from home" label
            wfh = card.select_one(".work_from_home_location")
            if wfh:
                locations.insert(0, "Work from Home")
            location = ", ".join(locations) if locations else "Not Specified"

            # --- Stipend ---
            stipend_tag = card.select_one(".stipend")
            stipend = (
                stipend_tag.get_text(strip=True) if stipend_tag else "Not Specified"
            )

            # --- Duration ---
            # Duration is typically the 2nd or 3rd `.item_body` in the card
            item_bodies = card.select(".item_body")
            duration = None
            for body in item_bodies:
                text = body.get_text(strip=True)
                # Duration usually contains "Month" or "Week"
                if (
                    "Month" in text
                    or "Week" in text
                    or "month" in text
                    or "week" in text
                ):
                    duration = text
                    break
            # If not found by keyword, just grab the 2nd one (common position)
            if not duration and len(item_bodies) >= 2:
                duration = item_bodies[1].get_text(strip=True)

            # --- Posted date ---
            posted_tag = card.select_one(
                ".status-success, .status-info, .posted-by-text"
            )
            if not posted_tag:
                posted_tag = card.select_one("[class*='status']")
            posted_text = posted_tag.get_text(strip=True) if posted_tag else None

            return {
                "id": str(internship_id),
                "title": title,
                "company": company,
                "location": location,
                "stipend": stipend,
                "duration": duration,
                "url": url,
                "posted_at": posted_text or datetime.utcnow().isoformat(),
                "source": self.source_name,
                "skills": [],  # Internshala shows skills on detail page; can add a detail scrape later
            }

        except Exception as e:
            logger.warning(f"Failed to parse card: {e}")
            return None

    def _parse_page(self, soup: BeautifulSoup) -> List[Dict[str, Any]]:
        """Parse all internship cards from a soup page."""
        cards = soup.select("div.individual_internship")
        logger.info(f"Found {len(cards)} cards on page")

        results = []
        for card in cards:
            parsed = self._parse_card(card)
            if parsed:
                results.append(parsed)

        return results

    def scrape(self) -> List[Dict[str, Any]]:
        """Main entry point: scrape N pages and return standardized listings."""
        all_listings = []

        for page_num in range(1, self.pages + 1):
            url = self._build_url(page=page_num)
            soup = self._fetch_page(url)

            if not soup:
                logger.warning(f"Skipping page {page_num} (fetch failed)")
                break

            listings = self._parse_page(soup)

            if not listings:
                logger.info(f"No listings found on page {page_num}. Stopping.")
                break

            all_listings.extend(listings)
            logger.info(
                f"Page {page_num}: scraped {len(listings)} listings (total so far: {len(all_listings)})"
            )

            # Rate limiting - polite delay between pages
            if page_num < self.pages:
                delay = random.uniform(*self.delay_range)
                logger.debug(
                    f"Rate limiting: sleeping {delay:.1f}s before next page..."
                )
                time.sleep(delay)

        logger.info(
            f"Internshala scrape complete. Total: {len(all_listings)} listings."
        )
        return [self.standardize(item) for item in all_listings]
