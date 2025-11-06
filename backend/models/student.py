from sqlalchemy import Column, Integer, String, ForeignKey, Float
from sqlalchemy.orm import relationship
from ..database import Base


class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    department = Column(String)
    skills = Column(String)  # comma separated for prototype
    gpa = Column(Float)
    location = Column(String)
    pref_domains = Column(String)
    pref_locations = Column(String)


