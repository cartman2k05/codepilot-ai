from datetime import datetime
from typing import List
from pydantic import BaseModel
from app.schemas.review import ReviewListItem

class DashboardStats(BaseModel):
    learning_score: float # 0 - 100
    repository_iq: float # 0 - 100
    memory_accuracy: float # 0 - 100
    suggestion_acceptance_rate: float # 0 - 100
    model_savings: float # dollars saved
    escalation_rate: float # percentage
    avg_review_time_ms: int
    code_health_score: float # 0 - 100

class CostDataPoint(BaseModel):
    date: str
    cost: float
    savings: float

class ActivityEntry(BaseModel):
    id: str
    type: str # 'review_completed', 'feedback_submitted', 'knowledge_extracted'
    description: str
    timestamp: datetime

class DashboardResponse(BaseModel):
    stats: DashboardStats
    recent_reviews: List[ReviewListItem]
    cost_over_time: List[CostDataPoint]
    activity_feed: List[ActivityEntry]
