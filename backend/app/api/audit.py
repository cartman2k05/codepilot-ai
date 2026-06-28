from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.audit import AuditLogResponse, AuditStats, EscalationEntry
from app.crud import audit as audit_crud

router = APIRouter()

@router.get("/", response_model=List[AuditLogResponse])
async def list_audit_logs_endpoint(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Returns paginated logs detailing LLM routing decisions and costs."""
    logs, total = await audit_crud.get_audit_logs(db, current_user.id, page, size)
    return logs

@router.get("/stats", response_model=AuditStats)
async def get_audit_stats_endpoint(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Gathers aggregates detailing cost savings and model routing distribution ratios."""
    stats = await audit_crud.get_audit_stats(db, current_user.id)
    return AuditStats(
        total_reviews=stats["total_reviews"],
        total_cost=round(stats["total_cost"], 4),
        avg_cost=round(stats["avg_cost"], 4),
        avg_latency_ms=round(stats["avg_latency_ms"], 1),
        avg_tokens=round(stats["avg_tokens"], 1),
        escalation_count=stats["escalation_count"],
        escalation_rate=round(stats["escalation_rate"], 1),
        model_usage=stats["model_usage"],
        total_saved=round(stats["total_saved"], 4)
    )

@router.get("/escalations", response_model=List[EscalationEntry])
async def get_escalations_endpoint(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Lists reviews where initial models were escalated to the Llama 70B flagship model."""
    logs = await audit_crud.get_escalations(db, current_user.id)
    
    entries = []
    for l in logs:
        entries.append(EscalationEntry(
            review_id=l.review_id,
            initial_model=l.initial_model,
            initial_confidence=l.initial_confidence or 0.0,
            final_model=l.final_model,
            cost=l.cost,
            latency_ms=l.latency_ms,
            created_at=l.created_at
        ))
        
    return entries
