from typing import List, Dict, Any, Optional, TypedDict

class FileInput(TypedDict):
    filename: str
    content: str
    language: Optional[str]

class ReviewState(TypedDict, total=False):
    # Input
    review_id: int
    user_id: int
    repo_id: Optional[int]
    files: List[FileInput]
    
    # Processing nodes output
    parsed_files: List[Dict[str, Any]]
    static_findings: List[Dict[str, Any]]
    memory_context: str
    knowledge_profile: str
    complexity_scores: Dict[str, float]
    avg_complexity: float
    
    # Model routing
    initial_model: str
    routing_reason: str
    
    # LLM review output
    initial_review: Optional[Dict[str, Any]]
    initial_confidence: float
    escalated: bool
    final_model: str
    final_review: Dict[str, Any]
    
    # Merging and reporting
    merged_issues: List[Dict[str, Any]]
    scores: Dict[str, float]
    
    # Metrics
    total_cost: float
    total_latency_ms: int
    total_tokens: int
    
    # Failure logging
    error: Optional[str]
