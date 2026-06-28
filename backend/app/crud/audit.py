from datetime import datetime, timedelta
from typing import Dict, List, Tuple
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.audit_log import AuditLog
from app.models.review import Review

async def create_audit_log(
    db: AsyncSession,
    **kwargs
) -> AuditLog:
    db_log = AuditLog(**kwargs)
    db.add(db_log)
    await db.commit()
    await db.refresh(db_log)
    return db_log

async def get_audit_logs(
    db: AsyncSession,
    user_id: int = None,
    page: int = 1,
    size: int = 20
) -> Tuple[List[AuditLog], int]:
    offset = (page - 1) * size
    
    # Base count query
    count_stmt = select(func.count()).select_from(AuditLog)
    select_stmt = select(AuditLog).order_by(AuditLog.created_at.desc())
    
    if user_id is not None:
        count_stmt = count_stmt.join(Review).where(Review.user_id == user_id)
        select_stmt = select_stmt.join(Review).where(Review.user_id == user_id)
        
    count_res = await db.execute(count_stmt)
    total = count_res.scalar_one_or_none() or 0
    
    select_res = await db.execute(select_stmt.offset(offset).limit(size))
    return list(select_res.scalars().all()), total

async def get_audit_stats(db: AsyncSession, user_id: int = None) -> Dict:
    # Aggregated stats
    stmt_base = select(
        func.count(Review.id).label("total_reviews"),
        func.sum(Review.cost).label("total_cost"),
        func.avg(Review.cost).label("avg_cost"),
        func.avg(Review.latency_ms).label("avg_latency"),
        func.avg(Review.tokens_used).label("avg_tokens"),
        func.sum(func.cast(Review.escalated, func.Integer)).label("escalation_count")
    )
    
    if user_id is not None:
        stmt_base = stmt_base.where(Review.user_id == user_id)
        
    res = await db.execute(stmt_base)
    row = res.one()
    
    total_reviews = row.total_reviews or 0
    total_cost = row.total_cost or 0.0
    avg_cost = row.avg_cost or 0.0
    avg_latency = row.avg_latency or 0.0
    avg_tokens = row.avg_tokens or 0.0
    escalation_count = row.escalation_count or 0
    
    # Calculate savings vs always using llama-3.3-70b-versatile
    # Pricing: $0.59 / 1M input tokens + $0.79 / 1M output tokens (approx $0.01 per review)
    # If we assume average review cost is $0.01 without routing, and actual is total_cost:
    # Let's say model savings = (always-flagship-cost - actual-cost)
    # Always-flagship-cost is roughly total_reviews * 0.01 (or $0.14 per code snippet as per specifications)
    # Let's calculate: always using flagship is $0.14 per review. Actual is actual review cost.
    always_flagship_unit = 0.14
    total_saved = max(0.0, (total_reviews * always_flagship_unit) - total_cost)
    
    # Model distribution count
    model_stmt = select(Review.model_used, func.count(Review.id))
    if user_id is not None:
        model_stmt = model_stmt.where(Review.user_id == user_id)
    model_stmt = model_stmt.group_by(Review.model_used)
    
    model_res = await db.execute(model_stmt)
    model_usage = {}
    for m, count in model_res.all():
        if m:
            model_usage[m] = count

    return {
        "total_reviews": total_reviews,
        "total_cost": total_cost,
        "avg_cost": avg_cost,
        "avg_latency_ms": avg_latency,
        "avg_tokens": avg_tokens,
        "escalation_count": escalation_count,
        "escalation_rate": (escalation_count / total_reviews * 100) if total_reviews > 0 else 0.0,
        "model_usage": model_usage,
        "total_saved": total_saved
    }

async def get_escalations(db: AsyncSession, user_id: int = None) -> List[AuditLog]:
    stmt = select(AuditLog).where(AuditLog.escalated == True).order_by(AuditLog.created_at.desc())
    if user_id is not None:
        stmt = stmt.join(Review).where(Review.user_id == user_id)
    result = await db.execute(stmt)
    return list(result.scalars().all())

async def get_cost_over_time(db: AsyncSession, user_id: int = None, days: int = 30) -> List[Dict]:
    # Group costs by date.
    start_date = datetime.now() - timedelta(days=days)
    
    # Construct database date grouping depending on SQLite vs Postgres
    # For compatibility, let's select review costs and complete times locally after fetching or use simple SQLite/Postgres routing
    stmt = select(Review.created_at, Review.cost).where(Review.created_at >= start_date)
    if user_id is not None:
        stmt = stmt.where(Review.user_id == user_id)
    
    result = await db.execute(stmt)
    rows = result.all()
    
    # Group in python to make it DB-agnostic (very safe for hackathons running sqlite locally and pg in docker)
    daily_data = {}
    for i in range(days):
        d = (datetime.now() - timedelta(days=i)).strftime("%Y-%m-%d")
        daily_data[d] = {"cost": 0.0, "count": 0}
        
    for created_at, cost in rows:
        date_str = created_at.strftime("%Y-%m-%d")
        if date_str in daily_data:
            daily_data[date_str]["cost"] += cost
            daily_data[date_str]["count"] += 1
            
    sorted_points = []
    # Return chronologically sorted list
    for date_str in sorted(daily_data.keys()):
        cost_val = daily_data[date_str]["cost"]
        count_val = daily_data[date_str]["count"]
        # Savings = (count_val * $0.14 flagship cost) - actual cost
        savings_val = max(0.0, (count_val * 0.14) - cost_val)
        sorted_points.append({
            "date": date_str,
            "cost": round(cost_val, 4),
            "savings": round(savings_val, 4)
        })
        
    return sorted_points
