from sqlalchemy import Column, Integer, String, ForeignKey
from ..database import Base


class Internship(Base):
    __tablename__ = "internships"

    id = Column(Integer, primary_key=True)
    org_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    title = Column(String, nullable=False)
    location = Column(String)
    duration_months = Column(Integer)
    stipend = Column(Integer)
    required_skills = Column(String)  # comma separated for prototype
    domain = Column(String)


