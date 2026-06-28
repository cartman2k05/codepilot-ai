from datetime import datetime
from typing import Dict, Optional
from pydantic import BaseModel

class AuditLogResponse(BaseModel):
    id: int
    review_id: int
    initial_model: str
    final_model: str
    reason: str
    escalated: bool
    initial_confidence: Optional[float] = None
    cost: float
    latency_ms: int
    tokens_input: int
    tokens_output: int
    complexity_score: Optional[float] = None
    created_at: datetime

    class Config:
        from_attributes = True

class AuditStats(BaseModel):
    total_reviews: int
    total_cost: float
    avg_cost: float
    avg_latency_ms: float
    avg_tokens: float
    escalation_count: int
    escalation_rate: float # percentage
    model_usage: Dict[str, int]
    total_saved: float # savings vs always using Llama 70B

class EscalationEntry(BaseModel):
    review_id: int
    initial_model: str
    initial_confidence: float
    final_model: str
    cost: float
    latency_ms: int
    created_at: datetime
