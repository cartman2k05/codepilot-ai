from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.repository import Repository
from app.models.knowledge_graph import KnowledgeEntry

async def create_repository(
    db: AsyncSession,
    name: str,
    user_id: int,
    description: Optional[str] = None
) -> Repository:
    repo = Repository(
        name=name,
        user_id=user_id,
        description=description
    )
    db.add(repo)
    await db.commit()
    await db.refresh(repo)
    return repo

async def get_repository_by_id(db: AsyncSession, repo_id: int) -> Optional[Repository]:
    result = await db.execute(select(Repository).where(Repository.id == repo_id))
    return result.scalar_one_or_none()

async def get_repositories_by_user(db: AsyncSession, user_id: int) -> List[Repository]:
    result = await db.execute(select(Repository).where(Repository.user_id == user_id).order_by(Repository.name))
    return list(result.scalars().all())

async def get_knowledge_entries(db: AsyncSession, repo_id: int) -> List[KnowledgeEntry]:
    result = await db.execute(
        select(KnowledgeEntry)
        .where(KnowledgeEntry.repo_id == repo_id)
        .order_by(KnowledgeEntry.category, KnowledgeEntry.confidence.desc())
    )
    return list(result.scalars().all())

async def upsert_knowledge_entry(
    db: AsyncSession,
    repo_id: int,
    category: str,
    key: str,
    value: str,
    confidence: float,
    source_review_id: Optional[int] = None
) -> KnowledgeEntry:
    # We want a database-independent upsert logic since we can run on SQLite locally or PostgreSQL in Docker
    stmt = select(KnowledgeEntry).where(
        KnowledgeEntry.repo_id == repo_id,
        KnowledgeEntry.category == category,
        KnowledgeEntry.key == key
    )
    result = await db.execute(stmt)
    entry = result.scalar_one_or_none()

    if entry:
        entry.value = value
        entry.confidence = confidence
        if source_review_id is not None:
            entry.source_review_id = source_review_id
    else:
        entry = KnowledgeEntry(
            repo_id=repo_id,
            category=category,
            key=key,
            value=value,
            confidence=confidence,
            source_review_id=source_review_id
        )
        db.add(entry)
        
    await db.commit()
    await db.refresh(entry)
    return entry
