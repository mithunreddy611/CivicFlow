from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models import Issue, User
from app.routes.auth import get_current_user
from app.schemas.issue import IssueResponse


router = APIRouter(
    prefix="/api/admin",
    tags=["Admin"],
)


@router.get("/dashboard")
def get_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "ADMIN":
        raise HTTPException(
            status_code=403,
            detail="Admin access required",
        )

    total_issues = db.query(Issue).count()

    status_counts = dict(
        db.query(
            Issue.status,
            func.count(Issue.id),
        )
        .group_by(Issue.status)
        .all()
    )

    category_counts = dict(
        db.query(
            Issue.category,
            func.count(Issue.id),
        )
        .group_by(Issue.category)
        .all()
    )

    priority_counts = dict(
        db.query(
            Issue.priority,
            func.count(Issue.id),
        )
        .group_by(Issue.priority)
        .all()
    )

    return {
        "total_issues": total_issues,
        "status_counts": status_counts,
        "category_counts": category_counts,
        "priority_counts": priority_counts,
    }


@router.get("/issues", response_model=list[IssueResponse])
def get_all_issues(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "ADMIN":
        raise HTTPException(
            status_code=403,
            detail="Admin access required",
        )

    issues = (
        db.query(Issue)
        .order_by(Issue.created_at.desc())
        .all()
    )

    return issues


@router.patch("/issues/{issue_id}/priority")
def update_priority(
    issue_id: int,
    priority: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "ADMIN":
        raise HTTPException(
            status_code=403,
            detail="Admin access required",
        )

    allowed_priorities = {
        "LOW",
        "MEDIUM",
        "HIGH",
        "CRITICAL",
    }

    priority = priority.upper()

    if priority not in allowed_priorities:
        raise HTTPException(
            status_code=400,
            detail="Invalid priority",
        )

    issue = (
        db.query(Issue)
        .filter(Issue.id == issue_id)
        .first()
    )

    if not issue:
        raise HTTPException(
            status_code=404,
            detail="Issue not found",
        )

    issue.priority = priority

    db.commit()
    db.refresh(issue)

    return {
        "message": "Priority updated successfully",
        "issue_id": issue.id,
        "priority": issue.priority,
    }