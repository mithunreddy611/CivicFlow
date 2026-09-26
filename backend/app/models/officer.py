from sqlalchemy import Column, Integer, Boolean, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class Officer(Base):
    __tablename__ = "officers"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
    )

    department_id = Column(
        Integer,
        ForeignKey("departments.id"),
        nullable=False,
    )

    active_issue_count = Column(
        Integer,
        nullable=False,
        default=0,
    )

    is_available = Column(
        Boolean,
        nullable=False,
        default=True,
    )

    user = relationship("User")

    department = relationship("Department")