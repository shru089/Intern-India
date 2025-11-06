from sqlalchemy import Column, Integer, String, ForeignKey
from ..database import Base


class Organization(Base):
    __tablename__ = "organizations"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    name = Column(String)
    website = Column(String)
    hq_location = Column(String)


