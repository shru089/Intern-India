from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, Index
from ..database import Base


class Internship(Base):
    __tablename__ = "internships"

    id = Column(Integer, primary_key=True)
    org_id = Column(
        Integer, ForeignKey("organizations.id"), nullable=True
    )  # Making it optional for external listings
    title = Column(String, nullable=False, index=True)
    company_name = Column(
        String, index=True
    )  # For external listings where we don't have an org_id
    location = Column(String, index=True)
    duration_months = Column(Integer)
    stipend = Column(String)  # Changed to String to allow for "10k-15k" or "Unpaid"
    required_skills = Column(String)
    domain = Column(String, index=True)
    source = Column(String, index=True)  # e.g., 'internshala', 'foundit', 'mygov'
    source_url = Column(String, unique=True)  # For direct link and deduplication
    external_id = Column(String, index=True)  # ID from the original platform
    posted_at = Column(String, index=True)  # ISO format timestamp
    is_government = Column(Boolean, default=False, index=True)
    rural_quota = Column(Boolean, default=False, index=True)

    # Composite indexes for common queries
    __table_args__ = (
        Index("idx_internship_source_gov", "source", "is_government"),
        Index("idx_internship_location_domain", "location", "domain"),
        Index("idx_internship_gov_rural", "is_government", "rural_quota"),
    )
