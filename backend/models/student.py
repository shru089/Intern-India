from sqlalchemy import Column, Integer, String, Float, Boolean
from ..database import Base


class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id         = Column(Integer, primary_key=True)
    # Keyed by email (MongoDB user identifier) — no cross-DB FK constraint
    user_email = Column(String, unique=True, nullable=False, index=True)
    # Legacy integer field kept for backward compat with old rows
    user_id    = Column(Integer, nullable=True)
    department = Column(String)
    skills     = Column(String)   # comma-separated
    gpa        = Column(Float)
    location   = Column(String)
    pref_domains   = Column(String)
    pref_locations = Column(String)
    is_rural       = Column(Boolean, default=False)

