from abc import ABC, abstractmethod
from typing import List, Dict, Any

class BaseScraper(ABC):
    def __init__(self, source_name: str):
        self.source_name = source_name

    @abstractmethod
    def scrape(self) -> List[Dict[str, Any]]:
        """
        Scrape the source and return a list of standardized internship dictionaries.
        """
        pass

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
            "posted_at": data.get("posted_at")
        }
