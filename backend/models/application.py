from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text
from datetime import datetime
from ..database import Base


class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    internship_id = Column(Integer, ForeignKey("internships.id"), nullable=False)
    status = Column(String, default="pending")  # pending, applied, shortlisted, rejected, hired
    apply_method = Column(String, default="easy_apply")  # easy_apply, quick_apply, manual
    notes = Column(Text, nullable=True)
    applied_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
