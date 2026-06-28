import pytest
from unittest.mock import MagicMock, patch
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.memory_service import MemoryService
from app.services.knowledge_service import knowledge_service
from app.crud import repositories as repos_crud

@pytest.mark.asyncio
async def test_memory_service_graceful_disconnected():
    # If hindsight is disconnected (default mock setup), it should return empty str and not crash
    service = MemoryService()
    service.client = None
    
    recalled = await service.recall_for_review(1, "def code(): pass")
    assert recalled == ""
    
    retained = await service.retain_feedback(1, "security", "SQL injection", "def sql(): pass", "accepted", 1)
    assert retained is False

@pytest.mark.asyncio
async def test_knowledge_graph_updates(db_session: AsyncSession, test_user):
    repo = await repos_crud.create_repository(db_session, "acme-repo", test_user.id)
    
    from app.models.review_issue import ReviewIssue
    issue = ReviewIssue(
        review_id=1,
        category="security",
        severity="high",
        title="Avoid Redux library",
        explanation="Redux causes boilerplate. React Query is better.",
        confidence=0.90,
        feedback_status="pending"
    )
    
    # Run user rejected redux suggestion (learning: avoid Redux)
    await knowledge_service.update_knowledge_from_feedback(
        db_session,
        repo_id=repo.id,
        issue=issue,
        action="rejected",
        review_id=1
    )
    
    entries = await repos_crud.get_knowledge_entries(db_session, repo.id)
    assert len(entries) == 1
    assert entries[0].category == "avoided"
    assert entries[0].key == "redux"
