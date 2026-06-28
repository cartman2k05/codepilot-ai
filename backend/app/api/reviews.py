from fastapi import APIRouter, BackgroundTasks, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import get_current_user
from app.core.exceptions import NotFoundError
from app.models.user import User
from app.schemas.review import (
    ReviewCreate,
    ReviewResponse,
    ReviewListItem,
    ReviewListResponse,
    ReviewStatusResponse
)
from app.crud import reviews as reviews_crud
from app.services.review_service import review_service

router = APIRouter()

@router.post("/", response_model=ReviewResponse)
async def create_review_endpoint(
    payload: ReviewCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Submits code blocks to review pipeline. Creates db structures and triggers 
    parsing, static analysis, and Groq LLM logic inside a background task.
    """
    # 1. Create a Review record in database
    db_review = await reviews_crud.create_review(
        db, 
        user_id=current_user.id,
        repo_id=payload.repo_id
    )
    
    # 2. Add async execution node runner in background task
    background_tasks.add_task(
        review_service.process_review,
        db=db,
        review_id=db_review.id,
        files=payload.files,
        repo_id=payload.repo_id,
        user_id=current_user.id
    )
    
    # 3. Reload structure and return ReviewResponse
    full_review = await reviews_crud.get_review_by_id(db, db_review.id)
    return full_review

@router.get("/", response_model=ReviewListResponse)
async def list_reviews_endpoint(
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List paginated review submissions for the logged in developer."""
    items, total = await reviews_crud.get_reviews_by_user(db, current_user.id, page, size)
    
    list_items = []
    for r in items:
        list_items.append(ReviewListItem(
            id=r.id,
            repo_id=r.repo_id,
            status=r.status,
            file_count=r.file_count,
            overall_score=r.overall_score,
            model_used=r.model_used,
            escalated=r.escalated,
            cost=r.cost,
            latency_ms=r.latency_ms,
            created_at=r.created_at,
            completed_at=r.completed_at
        ))
        
    return ReviewListResponse(
        items=list_items,
        total=total,
        page=page,
        size=size
    )

@router.get("/{review_id}", response_model=ReviewResponse)
async def get_review_endpoint(
    review_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Returns detailed files and category issues report for target review."""
    review = await reviews_crud.get_review_by_id(db, review_id)
    if not review or review.user_id != current_user.id:
        raise NotFoundError("Review report not found.")
    return review

@router.get("/{review_id}/status", response_model=ReviewStatusResponse)
async def get_review_status_endpoint(
    review_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Poll status endpoint to track review processing state progress."""
    review = await reviews_crud.get_review_by_id(db, review_id)
    if not review or review.user_id != current_user.id:
        raise NotFoundError("Review not found.")
        
    return ReviewStatusResponse(
        id=review.id,
        status=review.status,
        overall_score=review.overall_score,
        completed_at=review.completed_at
    )
