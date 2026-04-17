from sqlalchemy import Column, Integer, String, ForeignKey
from ..database import Base


class Internship(Base):
    __tablename__ = "internships"

    id = Column(Integer, primary_key=True)
    org_id = Column(Integer, ForeignKey("organizations.id"), nullable=True) # Making it optional for external listings
    title = Column(String, nullable=False)
    company_name = Column(String) # For external listings where we don't have an org_id
    location = Column(String)
    duration_months = Column(Integer)
    stipend = Column(String) # Changed to String to allow for "10k-15k" or "Unpaid"
    required_skills = Column(String) 
    domain = Column(String)
    source = Column(String) # e.g., 'internshala', 'foundit', 'mygov'
    source_url = Column(String, unique=True) # For direct link and deduplication
    external_id = Column(String) # ID from the original platform
    posted_at = Column(String) # ISO format timestamp


