from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel

class FeedbackCreate(BaseModel):
    action: Literal["accepted", "rejected", "ignored"]
    comment: Optional[str] = None

class FeedbackResponse(BaseModel):
    id: int
    issue_id: int
    user_id: int
    action: str
    comment: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
