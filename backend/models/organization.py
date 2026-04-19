from sqlalchemy import Column, Integer, String
from database import Base


class Organization(Base):
    __tablename__ = "organizations"

    id          = Column(Integer, primary_key=True)
    # Keyed by owner's email (MongoDB) — no cross-DB FK
    owner_email = Column(String, unique=True, nullable=True, index=True)
    user_id     = Column(Integer, nullable=True)  # legacy; no FK
    name        = Column(String)
    website     = Column(String)
    hq_location = Column(String)
