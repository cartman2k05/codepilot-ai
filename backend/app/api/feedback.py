from fastapi import APIRouter, BackgroundTasks, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import get_current_user
from app.core.exceptions import NotFoundError
from app.models.user import User
from app.schemas.feedback import FeedbackCreate, FeedbackResponse
from app.crud import feedback as feedback_crud
from app.crud import reviews as reviews_crud
from app.services.memory_service import memory_service
from app.services.knowledge_service import knowledge_service

router = APIRouter()

@router.post("/reviews/{review_id}/issues/{issue_id}/feedback", response_model=FeedbackResponse)
async def submit_feedback_endpoint(
    review_id: int,
    issue_id: int,
    payload: FeedbackCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Submits user action (accept, reject, ignore) on a specific issue.
    Updates the database state and schedules long-term memory learning tasks.
    """
    # 1. Validate review and issue exist
    review = await reviews_crud.get_review_by_id(db, review_id)
    if not review or review.user_id != current_user.id:
        raise NotFoundError("Review not found.")
        
    issue = None
    for i in review.issues:
        if i.id == issue_id:
            issue = i
            break
            
    if not issue:
        raise NotFoundError("Issue not found.")
        
    # 2. Update issue feedback status in database
    await reviews_crud.update_issue_feedback_status(db, issue_id, payload.action)
    
    # 3. Save detailed feedback entry
    db_feedback = await feedback_crud.create_feedback(
        db,
        issue_id=issue_id,
        user_id=current_user.id,
        action=payload.action,
        comment=payload.comment
    )
    
    # 4. Schedule background Hindsight and Knowledge Graph retention updates
    if review.repo_id:
        # Retain raw feedback statement in Hindsight
        background_tasks.add_task(
            memory_service.retain_feedback,
            repo_id=review.repo_id,
            category=issue.category,
            issue_title=issue.title,
            code_snippet=issue.suggested_fix or "",
            action=payload.action,
            review_id=review_id
        )
        
        # Analyze and update structural preferences in Team Knowledge Graph
        background_tasks.add_task(
            knowledge_service.update_knowledge_from_feedback,
            db=db,
            repo_id=review.repo_id,
            issue=issue,
            action=payload.action,
            review_id=review_id
        )

    return FeedbackResponse(
        id=db_feedback.id,
        issue_id=db_feedback.issue_id,
        user_id=db_feedback.user_id,
        action=db_feedback.action,
        comment=db_feedback.comment,
        created_at=db_feedback.created_at
    )
