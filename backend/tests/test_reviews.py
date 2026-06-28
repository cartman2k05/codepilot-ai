import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from app.crud import repositories as repos_crud

@pytest.mark.asyncio
async def test_create_review(client: AsyncClient, db_session: AsyncSession, auth_headers: dict, test_user):
    # Create repository first
    repo = await repos_crud.create_repository(db_session, "test-repo", test_user.id)
    
    payload = {
        "repo_id": repo.id,
        "files": [
            {
                "filename": "hello.py",
                "content": "def hello():\n    print('hello world')",
                "language": "python"
            }
        ]
    }
    
    response = await client.post("/api/reviews/", json=payload, headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "pending"
    assert data["repo_id"] == repo.id
    
    # Assert review status endpoint works
    review_id = data["id"]
    status_resp = await client.get(f"/api/reviews/{review_id}/status", headers=auth_headers)
    assert status_resp.status_code == 200
    assert status_resp.json()["status"] == "pending"

@pytest.mark.asyncio
async def test_list_reviews(client: AsyncClient, auth_headers: dict):
    response = await client.get("/api/reviews/", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data
    assert isinstance(data["items"], list)
