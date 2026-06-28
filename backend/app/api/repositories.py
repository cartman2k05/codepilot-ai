from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import get_current_user
from app.core.exceptions import NotFoundError, BadRequestError
from app.models.user import User
from app.schemas.memory import RepositoryKnowledge, KnowledgeEntryResponse
from app.crud import repositories as repos_crud

# Simple request schema since it's a small POST body
from pydantic import BaseModel
class RepoCreateRequest(BaseModel):
    name: str
    description: str = None

class RepoResponse(BaseModel):
    id: int
    name: str
    description: str = None
    user_id: int

    class Config:
        from_attributes = True

router = APIRouter()

@router.post("/", response_model=RepoResponse)
async def create_repository_endpoint(
    payload: RepoCreateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Registers a code repository for tracking Team Knowledge Graph profiles."""
    if not payload.name:
        raise BadRequestError("Repository name cannot be empty.")
    repo = await repos_crud.create_repository(
        db, 
        name=payload.name, 
        user_id=current_user.id,
        description=payload.description
    )
    return repo

@router.get("/", response_model=List[RepoResponse])
async def list_repositories_endpoint(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Lists registered repositories owned by the authenticated developer."""
    repos = await repos_crud.get_repositories_by_user(db, current_user.id)
    return repos

@router.get("/{repo_id}/knowledge", response_model=RepositoryKnowledge)
async def get_repository_knowledge_endpoint(
    repo_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Fetches the compiled Team Knowledge Graph profile for the repository 
    segregated into frameworks, conventions, patterns, testing, and avoided.
    """
    repo = await repos_crud.get_repository_by_id(db, repo_id)
    if not repo or repo.user_id != current_user.id:
        raise NotFoundError("Repository not found.")
        
    from app.services.knowledge_service import knowledge_service
    grouped = await knowledge_service.get_knowledge_entries_grouped(db, repo_id)
    
    # Map to schema classes
    def map_entry(e):
        return KnowledgeEntryResponse(
            id=e.id,
            category=e.category,
            key=e.key,
            value=e.value,
            confidence=e.confidence,
            source_review_id=e.source_review_id,
            created_at=e.created_at,
            updated_at=e.updated_at
        )

    return RepositoryKnowledge(
        repo_id=repo.id,
        repo_name=repo.name,
        frameworks=[map_entry(e) for e in grouped["frameworks"]],
        conventions=[map_entry(e) for e in grouped["conventions"]],
        patterns=[map_entry(e) for e in grouped["patterns"]],
        testing=[map_entry(e) for e in grouped["testing"]],
        avoided=[map_entry(e) for e in grouped["avoided"]]
    )
