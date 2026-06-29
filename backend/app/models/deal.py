from datetime import datetime

from sqlalchemy import Column, Date, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


class Deal(Base):
    __tablename__ = "deals"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False, index=True)
    title = Column(String, nullable=False)
    value = Column(Float, nullable=False)
    pipeline_stage = Column(String, nullable=False)
    expected_close_date = Column(Date, nullable=False)
    notes = Column(Text, nullable=True)
    company = relationship("Company", back_populates="deals")
    activities = relationship("Activity", back_populates="deal")
    tasks = relationship("Task", back_populates="deal")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )
