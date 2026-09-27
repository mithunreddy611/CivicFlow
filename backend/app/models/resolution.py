from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database import Base


class ResolutionProof(Base):
    __tablename__ = "resolution_proofs"

    id = Column(Integer, primary_key=True, index=True)

    issue_id = Column(
        Integer,
        ForeignKey("issues.id"),
        nullable=False,
    )

    after_image = Column(
        String(500),
        nullable=False,
    )

    remarks = Column(
        String(1000),
        nullable=True,
    )

    submitted_by = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
    )

    submitted_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    citizen_verified = Column(
        Boolean,
        nullable=True,
    )

    citizen_remarks = Column(
        String(1000),
        nullable=True,
    )

    verified_at = Column(
        DateTime(timezone=True),
        nullable=True,
    )

    issue = relationship("Issue")

    submitter = relationship("User")