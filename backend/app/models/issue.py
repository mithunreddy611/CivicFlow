from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database import Base


class Issue(Base):
    __tablename__ = "issues"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(
        String(200),
        nullable=False,
    )

    description = Column(
        String(1000),
        nullable=False,
    )

    category = Column(
        String(50),
        nullable=False,
    )

    latitude = Column(
        Float,
        nullable=True,
    )

    longitude = Column(
        Float,
        nullable=True,
    )

    location_text = Column(
        String(300),
        nullable=True,
    )

    before_image = Column(
        String(500),
        nullable=True,
    )

    priority = Column(
        String(20),
        nullable=False,
        default="MEDIUM",
    )

    status = Column(
        String(30),
        nullable=False,
        default="REPORTED",
    )

    department_id = Column(
        Integer,
        ForeignKey("departments.id"),
        nullable=True,
    )

    officer_id = Column(
        Integer,
        ForeignKey("officers.id"),
        nullable=True,
    )

    reported_by = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    department = relationship("Department")
    officer = relationship("Officer")
    reporter = relationship("User")

    @property
    def department_name(self):
        return self.department.name if self.department else None

    @property
    def officer_name(self):
        return self.officer.user.name if self.officer and self.officer.user else None