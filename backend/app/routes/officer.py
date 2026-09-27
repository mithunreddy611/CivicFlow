import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Issue, IssueHistory, ResolutionProof, User
from app.routes.auth import get_current_user
from app.schemas.resolution import ResolutionResponse
from app.schemas.issue import IssueResponse


router = APIRouter(
    prefix="/api/officer",
    tags=["Officer"],
)


@router.get("/issues")
def get_officer_issues(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "OFFICER":
        raise HTTPException(
            status_code=403,
            detail="Only officers can access officer issues",
        )

    issues = (
        db.query(Issue)
        .filter(
            Issue.officer.has(user_id=current_user.id)
        )
        .order_by(Issue.created_at.desc())
        .all()
    )

    return issues


@router.post(
    "/issues/{issue_id}/start",
    response_model=IssueResponse,
)
def start_issue(
    issue_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "OFFICER":
        raise HTTPException(
            status_code=403,
            detail="Only officers can start issues",
        )

    issue = db.query(Issue).filter(
        Issue.id == issue_id
    ).first()

    if not issue:
        raise HTTPException(
            status_code=404,
            detail="Issue not found",
        )

    if not issue.officer or issue.officer.user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="This issue is not assigned to you",
        )

    if issue.status not in ["ASSIGNED", "REOPENED"]:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot start issue from status {issue.status}",
        )

    old_status = issue.status
    issue.status = "IN_PROGRESS"

    history = IssueHistory(
        issue_id=issue.id,
        old_status=old_status,
        new_status="IN_PROGRESS",
        changed_by=current_user.id,
        remarks="Officer started working on the issue",
    )

    db.add(history)
    db.commit()
    db.refresh(issue)

    return issue


@router.get("/issues/{issue_id}")
def get_officer_issue(
    issue_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "OFFICER":
        raise HTTPException(
            status_code=403,
            detail="Only officers can access this endpoint",
        )

    issue = db.query(Issue).filter(
        Issue.id == issue_id
    ).first()

    if not issue:
        raise HTTPException(
            status_code=404,
            detail="Issue not found",
        )

    if not issue.officer or issue.officer.user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="This issue is not assigned to you",
        )

    return issue
@router.post(
    "/issues/{issue_id}/resolve",
    response_model=ResolutionResponse,
)
async def resolve_issue(
    issue_id: int,
    after_image: UploadFile = File(...),
    remarks: str = Form(""),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "OFFICER":
        raise HTTPException(
            status_code=403,
            detail="Only officers can resolve issues",
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

    if not issue.officer or issue.officer.user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="This issue is not assigned to you",
        )

    if issue.status != "IN_PROGRESS":
        raise HTTPException(
            status_code=400,
            detail="Only issues in progress can be resolved",
        )

    # Validate file type
    allowed_types = {
        "image/jpeg",
        "image/png",
        "image/webp",
    }

    if after_image.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Only JPG, PNG, and WEBP images are allowed",
        )

    # Read uploaded image
    image_data = await after_image.read()

    if not image_data:
        raise HTTPException(
            status_code=400,
            detail="Uploaded image is empty",
        )

    # Generate a unique filename
    extension = os.path.splitext(
        after_image.filename or ""
    )[1].lower()

    if extension not in [".jpg", ".jpeg", ".png", ".webp"]:
        extension = ".jpg"

    filename = f"{uuid.uuid4().hex}{extension}"

    upload_directory = os.path.join(
        "uploads",
        "resolutions",
    )

    os.makedirs(
        upload_directory,
        exist_ok=True,
    )

    file_path = os.path.join(
        upload_directory,
        filename,
    )

    # Save image to disk
    with open(file_path, "wb") as file:
        file.write(image_data)

    # Store relative path in database
    image_path = f"/uploads/resolutions/{filename}"

    proof = ResolutionProof(
        issue_id=issue.id,
        after_image=image_path,
        remarks=remarks,
        submitted_by=current_user.id,
    )

    old_status = issue.status
    issue.status = "AWAITING_VERIFICATION"

    db.add(proof)

    history = IssueHistory(
        issue_id=issue.id,
        old_status=old_status,
        new_status="AWAITING_VERIFICATION",
        changed_by=current_user.id,
        remarks="Officer submitted resolution proof",
    )

    db.add(history)

    db.commit()
    db.refresh(proof)

    return proof