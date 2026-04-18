from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, Index
from datetime import datetime
from ..database import Base


class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True)
    student_id = Column(String, nullable=False, index=True)
    student_email = Column(
        String, nullable=True, index=True
    )  # Store email for easier lookup
    internship_id = Column(
        Integer, ForeignKey("internships.id"), nullable=False, index=True
    )
    status = Column(
        String, default="pending", index=True
    )  # pending, applied, shortlisted, rejected, hired
    apply_method = Column(
        String, default="easy_apply"
    )  # easy_apply, quick_apply, manual
    notes = Column(Text, nullable=True)
    applied_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Composite indexes for common queries
    __table_args__ = (
        Index("idx_application_student_status", "student_id", "status"),
        Index("idx_application_internship_status", "internship_id", "status"),
        Index("idx_application_status_applied", "status", "applied_at"),
    )
