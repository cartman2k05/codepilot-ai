from datetime import datetime
from typing import List, Optional, Tuple
from sqlalchemy import select, func, update
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.review import Review, ReviewFile
from app.models.review_issue import ReviewIssue

async def create_review(
    db: AsyncSession,
    user_id: int,
    repo_id: Optional[int] = None
) -> Review:
    db_review = Review(
        user_id=user_id,
        repo_id=repo_id,
        status="pending"
    )
    db.add(db_review)
    await db.commit()
    await db.refresh(db_review)
    return db_review

async def get_review_by_id(db: AsyncSession, review_id: int) -> Optional[Review]:
    # Use selectinload to eagerly fetch related files and issues
    stmt = (
        select(Review)
        .where(Review.id == review_id)
        .options(
            selectinload(Review.files),
            selectinload(Review.issues)
        )
    )
    result = await db.execute(stmt)
    return result.scalar_one_or_none()

async def get_reviews_by_user(
    db: AsyncSession,
    user_id: int,
    page: int = 1,
    size: int = 10
) -> Tuple[List[Review], int]:
    offset = (page - 1) * size
    
    # Get total count
    count_stmt = select(func.count()).select_from(Review).where(Review.user_id == user_id)
    count_result = await db.execute(count_stmt)
    total = count_result.scalar_one_or_none() or 0
    
    # Get records
    stmt = (
        select(Review)
        .where(Review.user_id == user_id)
        .order_by(Review.created_at.desc())
        .offset(offset)
        .limit(size)
    )
    result = await db.execute(stmt)
    return list(result.scalars().all()), total

async def update_review_status(
    db: AsyncSession,
    review_id: int,
    status: str,
    **kwargs
) -> Optional[Review]:
    update_data = {"status": status}
    if status == "completed":
        update_data["completed_at"] = datetime.now()
    
    for k, v in kwargs.items():
        if v is not None:
            update_data[k] = v

    stmt = (
        update(Review)
        .where(Review.id == review_id)
        .values(**update_data)
    )
    await db.execute(stmt)
    await db.commit()
    return await get_review_by_id(db, review_id)

async def create_review_file(
    db: AsyncSession,
    review_id: int,
    filename: str,
    language: str,
    content: str,
    line_count: int
) -> ReviewFile:
    db_file = ReviewFile(
        review_id=review_id,
        filename=filename,
        language=language,
        content=content,
        line_count=line_count
    )
    db.add(db_file)
    await db.commit()
    await db.refresh(db_file)
    return db_file

async def create_review_issue(
    db: AsyncSession,
    **kwargs
) -> ReviewIssue:
    db_issue = ReviewIssue(**kwargs)
    db.add(db_issue)
    await db.commit()
    await db.refresh(db_issue)
    return db_issue

async def update_issue_feedback_status(
    db: AsyncSession,
    issue_id: int,
    status: str
) -> Optional[ReviewIssue]:
    stmt = (
        update(ReviewIssue)
        .where(ReviewIssue.id == issue_id)
        .values(feedback_status=status)
    )
    await db.execute(stmt)
    await db.commit()
    
    # Reload and return
    res = await db.execute(select(ReviewIssue).where(ReviewIssue.id == issue_id))
    return res.scalar_one_or_none()
