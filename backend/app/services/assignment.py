from sqlalchemy.orm import Session

from app.models import Officer


def assign_officer(
    db: Session,
    department_id: int,
):
    officer = (
        db.query(Officer)
        .filter(
            Officer.department_id == department_id,
            Officer.is_available == True,
        )
        .order_by(Officer.active_issue_count.asc())
        .first()
    )

    if not officer:
        return None

    officer.active_issue_count += 1
    db.commit()
    db.refresh(officer)

    return officer