from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel

class CategoryCount(BaseModel):
    category: str
    count: int

class MemoryStats(BaseModel):
    total_memories: int
    accepted_count: int
    rejected_count: int
    ignored_count: int
    acceptance_rate: float
    learning_velocity: float # memories created per day/week/review
    top_categories: List[CategoryCount]

class MemoryTimelineEntry(BaseModel):
    review_id: int
    review_number: int
    learned: List[str]
    timestamp: datetime

class MemoryEvolution(BaseModel):
    entries: List[MemoryTimelineEntry]

class KnowledgeEntryResponse(BaseModel):
    id: int
    category: str
    key: str
    value: str
    confidence: float
    source_review_id: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class RepositoryKnowledge(BaseModel):
    repo_id: int
    repo_name: str
    frameworks: List[KnowledgeEntryResponse]
    conventions: List[KnowledgeEntryResponse]
    patterns: List[KnowledgeEntryResponse]
    testing: List[KnowledgeEntryResponse]
    avoided: List[KnowledgeEntryResponse]
