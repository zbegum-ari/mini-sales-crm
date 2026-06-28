from datetime import datetime

from sqlalchemy import Boolean, CheckConstraint, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.core.database import Base


class User(Base):
    __tablename__ = "users"
    __table_args__ = (
        CheckConstraint(
            "role IN ('platform_admin', 'org_admin', 'user')",
            name="users_role_check",
        ),
        CheckConstraint(
            "(role = 'platform_admin' AND organization_id IS NULL) "
            "OR (role IN ('org_admin', 'user') AND organization_id IS NOT NULL)",
            name="users_role_organization_check",
        ),
    )

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False, unique=True, index=True)
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False, default="user")
    is_active = Column(Boolean, nullable=False, default=True)
    organization = relationship("Organization", back_populates="users")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )
