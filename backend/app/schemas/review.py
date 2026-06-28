from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field

class FileUpload(BaseModel):
    filename: str
    content: str
    language: Optional[str] = None

class ReviewCreate(BaseModel):
    repo_id: Optional[int] = None
    files: List[FileUpload]

class ReviewFileResponse(BaseModel):
    id: int
    filename: str
    language: str
    content: str
    line_count: int

    class Config:
        from_attributes = True

class IssueResponse(BaseModel):
    id: int
    review_id: int
    file_id: Optional[int] = None
    category: str
    severity: str
    title: str
    explanation: str
    suggested_fix: Optional[str] = None
    improved_code: Optional[str] = None
    confidence: float
    line_start: Optional[int] = None
    line_end: Optional[int] = None
    source: str
    feedback_status: str

    class Config:
        from_attributes = True

class ReviewResponse(BaseModel):
    id: int
    repo_id: Optional[int] = None
    user_id: int
    status: str
    file_count: int
    overall_score: Optional[float] = None
    security_score: Optional[float] = None
    performance_score: Optional[float] = None
    maintainability_score: Optional[float] = None
    testing_score: Optional[float] = None
    architecture_score: Optional[float] = None
    readability_score: Optional[float] = None
    model_used: Optional[str] = None
    escalated: bool
    cost: float
    latency_ms: int
    tokens_used: int
    created_at: datetime
    completed_at: Optional[datetime] = None
    files: List[ReviewFileResponse] = []
    issues: List[IssueResponse] = []

    class Config:
        from_attributes = True

class ReviewListItem(BaseModel):
    id: int
    repo_id: Optional[int] = None
    status: str
    file_count: int
    overall_score: Optional[float] = None
    model_used: Optional[str] = None
    escalated: bool
    cost: float
    latency_ms: int
    created_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ReviewListResponse(BaseModel):
    items: List[ReviewListItem]
    total: int
    page: int
    size: int

class ReviewStatusResponse(BaseModel):
    id: int
    status: str
    overall_score: Optional[float] = None
    completed_at: Optional[datetime] = None

class ReviewScores(BaseModel):
    overall: float
    security: float
    performance: float
    maintainability: float
    testing: float
    architecture: float
    readability: float
