from typing import Optional

from pydantic import BaseModel


class IssueCreate(BaseModel):
    title: str
    description: str
    category: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    location_text: Optional[str] = None
    priority: str = "MEDIUM"

class IssueResponse(BaseModel):
    id: int
    title: str
    description: str
    category: str
    latitude: Optional[float]
    longitude: Optional[float]
    location_text: Optional[str]
    before_image: Optional[str]
    priority: str
    status: str
    department_id: Optional[int]
    department_name: Optional[str] = None
    officer_id: Optional[int]
    officer_name: Optional[str] = None
    reported_by: int

    class Config:
        from_attributes = True