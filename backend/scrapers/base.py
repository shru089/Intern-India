import asyncio
import time
import random
import logging
from abc import ABC, abstractmethod
from typing import List, Dict, Any

logger = logging.getLogger(__name__)


class BaseScraper(ABC):
    def __init__(
        self, source_name: str, max_retries: int = 3, delay_range: tuple = (2, 5)
    ):
        self.source_name = source_name
        self.max_retries = max_retries
        self.delay_range = delay_range

    async def fetch_with_retry_async(
        self, url: str, headers: Dict[str, str] = None
    ) -> str | None:
        """Fetch URL with retry logic and anti-bot delays (async version)."""
        import httpx

        default_headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
            "Accept-Encoding": "gzip, deflate",
            "Connection": "keep-alive",
            "Upgrade-Insecure-Requests": "1",
        }
        if headers:
            default_headers.update(headers)

        async with httpx.AsyncClient(timeout=30.0) as client:
            for attempt in range(self.max_retries):
                try:
                    # Random delay to avoid detection
                    delay = random.uniform(*self.delay_range)
                    await asyncio.sleep(delay)

                    response = await client.get(url, headers=default_headers)
                    response.raise_for_status()

                    # Additional delay after successful request
                    await asyncio.sleep(random.uniform(1, 3))

                    return response.text

                except httpx.RequestError as e:
                    logger.warning(
                        f"{self.source_name} fetch attempt {attempt + 1}/{self.max_retries} failed: {e}"
                    )
                    if attempt < self.max_retries - 1:
                        # Exponential backoff
                        backoff_delay = (2**attempt) * random.uniform(1, 3)
                        logger.info(f"Retrying in {backoff_delay:.1f}s...")
                        await asyncio.sleep(backoff_delay)
                    else:
                        logger.error(
                            f"{self.source_name} failed to fetch {url} after {self.max_retries} attempts"
                        )

        return None

    def fetch_with_retry(self, url: str, headers: Dict[str, str] = None) -> str | None:
        """Fetch URL with retry logic and anti-bot delays (sync version for compatibility)."""
        import requests

        default_headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
            "Accept-Encoding": "gzip, deflate",
            "Connection": "keep-alive",
            "Upgrade-Insecure-Requests": "1",
        }
        if headers:
            default_headers.update(headers)

        for attempt in range(self.max_retries):
            try:
                # Random delay to avoid detection
                delay = random.uniform(*self.delay_range)
                time.sleep(delay)

                response = requests.get(url, headers=default_headers, timeout=30)
                response.raise_for_status()

                # Additional delay after successful request
                time.sleep(random.uniform(1, 3))

                return response.text

            except requests.RequestException as e:
                logger.warning(
                    f"{self.source_name} fetch attempt {attempt + 1}/{self.max_retries} failed: {e}"
                )
                if attempt < self.max_retries - 1:
                    # Exponential backoff
                    backoff_delay = (2**attempt) * random.uniform(1, 3)
                    logger.info(f"Retrying in {backoff_delay:.1f}s...")
                    time.sleep(backoff_delay)
                else:
                    logger.error(
                        f"{self.source_name} failed to fetch {url} after {self.max_retries} attempts"
                    )

        return None

    @abstractmethod
    def scrape(self) -> List[Dict[str, Any]]:
        """
        Scrape the source and return a list of standardized internship dictionaries.
        """
        pass

    async def scrape_async(self) -> List[Dict[str, Any]]:
        """
        Async version of scrape. Default implementation runs sync scrape in thread pool.
        Subclasses can override for true async implementation.
        """
        import asyncio

        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, self.scrape)

    def standardize(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Ensure the data matches our internal Internship model.
        """
        return {
            "title": data.get("title"),
            "company_name": data.get("company"),
            "location": data.get("location"),
            "stipend": str(data.get("stipend", "Not Specified")),
            "duration_months": data.get("duration"),
            "required_skills": ",".join(data.get("skills", [])),
            "source": self.source_name,
            "source_url": data.get("url"),
            "external_id": data.get("id"),
            "posted_at": data.get("posted_at"),
            "is_government": data.get("is_government", False),
            "rural_quota": data.get("rural_quota", False),
        }
