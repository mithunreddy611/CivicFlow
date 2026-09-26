import os
import uuid

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    UploadFile,
    File,
    Form,
    status,
)
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Issue, Department, IssueHistory, User
from app.routes.auth import get_current_user
from app.schemas.issue import IssueResponse
from app.services.routing import get_department_name
from app.services.assignment import assign_officer


router = APIRouter(
    prefix="/api/issues",
    tags=["Issues"],
)


@router.post(
    "",
    response_model=IssueResponse,
    status_code=status.HTTP_201_CREATED,
)

async def create_issue(
    title: str = Form(...),
    description: str = Form(...),
    category: str = Form(...),
    latitude: float | None = Form(None),
    longitude: float | None = Form(None),
    location_text: str | None = Form(None),
    priority: str = Form("MEDIUM"),
    before_image: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Only citizens can report issues
    if current_user.role != "CITIZEN":
        raise HTTPException(
            status_code=403,
            detail="Only citizens can report issues",
        )

    # Validate uploaded image
    allowed_types = {
        "image/jpeg",
        "image/png",
        "image/webp",
    }

    if before_image.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Only JPG, PNG, and WEBP images are allowed",
        )

    image_data = await before_image.read()

    if not image_data:
        raise HTTPException(
            status_code=400,
            detail="Uploaded image is empty",
        )

    # Find department from issue category
    try:
        department_name = get_department_name(category)
    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )

    department = (
        db.query(Department)
        .filter(Department.name == department_name)
        .first()
    )

    if not department:
        raise HTTPException(
            status_code=500,
            detail="Department configuration not found",
        )

    # Automatically assign an available officer
    officer = assign_officer(
        db=db,
        department_id=department.id,
    )

    if not officer:
        raise HTTPException(
            status_code=503,
            detail="No available officer in this department",
        )

    # Create upload directory
    upload_directory = os.path.join(
        "uploads",
        "issues",
    )

    os.makedirs(
        upload_directory,
        exist_ok=True,
    )

    # Generate unique filename
    extension = os.path.splitext(
        before_image.filename or ""
    )[1].lower()

    if extension not in [".jpg", ".jpeg", ".png", ".webp"]:
        extension = ".jpg"

    filename = f"{uuid.uuid4().hex}{extension}"

    file_path = os.path.join(
        upload_directory,
        filename,
    )

    # Save image
    with open(file_path, "wb") as file:
        file.write(image_data)

    # Store relative path in database
    image_path = f"/uploads/issues/{filename}"

    # Create issue
    issue = Issue(
        title=title,
        description=description,
        category=category.upper(),
        latitude=latitude,
        longitude=longitude,
        location_text=location_text,
        before_image=image_path,
        priority=priority.upper(),
        status="ASSIGNED",
        department_id=department.id,
        officer_id=officer.id,
        reported_by=current_user.id,
    )

    db.add(issue)
    db.commit()
    db.refresh(issue)

    # Record status history
    history = IssueHistory(
        issue_id=issue.id,
        old_status=None,
        new_status="ASSIGNED",
        changed_by=current_user.id,
        remarks="Issue reported with before image and automatically assigned",
    )

    db.add(history)
    db.commit()

    return issue