from typing import Optional

from pydantic import BaseModel


class ResolutionResponse(BaseModel):
    id: int
    issue_id: int
    after_image: str
    remarks: Optional[str] = None
    submitted_by: int
    citizen_verified: Optional[bool] = None
    citizen_remarks: Optional[str] = None

    class Config:
        from_attributes = True


class VerifyIssueRequest(BaseModel):
    approved: bool
    remarks: Optional[str] = None