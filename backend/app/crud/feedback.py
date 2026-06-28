from typing import Dict, List
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.feedback import Feedback
from app.models.review import Review
from app.models.review_issue import ReviewIssue

async def create_feedback(
    db: AsyncSession,
    issue_id: int,
    user_id: int,
    action: str,
    comment: str = None
) -> Feedback:
    db_feedback = Feedback(
        issue_id=issue_id,
        user_id=user_id,
        action=action,
        comment=comment
    )
    db.add(db_feedback)
    await db.commit()
    await db.refresh(db_feedback)
    return db_feedback

async def get_feedback_by_issue(db: AsyncSession, issue_id: int) -> List[Feedback]:
    result = await db.execute(
        select(Feedback)
        .where(Feedback.issue_id == issue_id)
        .order_by(Feedback.created_at.desc())
    )
    return list(result.scalars().all())

async def get_feedback_stats(db: AsyncSession, user_id: int) -> Dict[str, int]:
    # Count accepted, rejected, ignored feedbacks
    stmt = (
        select(Feedback.action, func.count())
        .where(Feedback.user_id == user_id)
        .group_by(Feedback.action)
    )
    result = await db.execute(stmt)
    
    stats = {"accepted": 0, "rejected": 0, "ignored": 0}
    for action, count in result.all():
        # Map values accepted/accepted, rejected/rejected, ignored/ignored
        action_key = action.lower()
        if action_key in stats:
            stats[action_key] = count
            
    return stats
