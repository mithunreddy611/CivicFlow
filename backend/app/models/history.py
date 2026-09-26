from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database import Base


class IssueHistory(Base):
    __tablename__ = "issue_history"

    id = Column(Integer, primary_key=True, index=True)

    issue_id = Column(
        Integer,
        ForeignKey("issues.id"),
        nullable=False,
    )

    old_status = Column(
        String(30),
        nullable=True,
    )

    new_status = Column(
        String(30),
        nullable=False,
    )

    changed_by = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
    )

    remarks = Column(
        String(1000),
        nullable=True,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    issue = relationship("Issue")

    user = relationship("User")