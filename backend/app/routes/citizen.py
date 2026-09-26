from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Issue, IssueHistory, ResolutionProof, User
from app.routes.auth import get_current_user
from app.schemas.resolution import VerifyIssueRequest


router = APIRouter(
    prefix="/api/citizen",
    tags=["Citizen"],
)


@router.post("/issues/{issue_id}/verify")
def verify_issue(
    issue_id: int,
    data: VerifyIssueRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Only citizens can verify resolutions
    if current_user.role != "CITIZEN":
        raise HTTPException(
            status_code=403,
            detail="Only citizens can verify issues",
        )

    # Find the issue
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

    # Only the citizen who reported the issue can verify it
    if issue.reported_by != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Only the citizen who reported this issue can verify it",
        )

    # Verification is only allowed after officer resolution
    if issue.status != "AWAITING_VERIFICATION":
        raise HTTPException(
            status_code=400,
            detail="Issue is not awaiting verification",
        )

    # Get the latest resolution proof
    proof = (
        db.query(ResolutionProof)
        .filter(
            ResolutionProof.issue_id == issue.id
        )
        .order_by(ResolutionProof.submitted_at.desc())
        .first()
    )

    if not proof:
        raise HTTPException(
            status_code=404,
            detail="Resolution proof not found",
        )

    # Store citizen decision
    proof.citizen_verified = data.approved
    proof.citizen_remarks = data.remarks
    proof.verified_at = datetime.utcnow()

    old_status = issue.status

    if data.approved:
        # Citizen accepts the resolution
        issue.status = "CLOSED"

        # Officer no longer has an active issue
        if issue.officer:
            if issue.officer.active_issue_count > 0:
                issue.officer.active_issue_count -= 1

        history_remarks = (
            data.remarks
            or "Citizen verified the resolution"
        )

    else:
        # Citizen rejects the resolution
        issue.status = "REOPENED"

        # Keep officer's active issue count unchanged
        history_remarks = (
            data.remarks
            or "Citizen rejected the resolution and reopened the issue"
        )

    # Record status change
    history = IssueHistory(
        issue_id=issue.id,
        old_status=old_status,
        new_status=issue.status,
        changed_by=current_user.id,
        remarks=history_remarks,
    )

    db.add(history)
    db.commit()
    db.refresh(issue)

    return {
        "message": (
            "Issue closed successfully"
            if data.approved
            else "Issue reopened successfully"
        ),
        "issue_id": issue.id,
        "status": issue.status,
        "citizen_verified": proof.citizen_verified,
        "citizen_remarks": proof.citizen_remarks,
    }