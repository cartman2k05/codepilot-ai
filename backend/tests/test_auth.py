import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_demo_login(client: AsyncClient):
    response = await client.post(
        "/api/auth/demo-login",
        json={"username": "test_pilot"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["username"] == "test_pilot"

@pytest.mark.asyncio
async def test_get_me(client: AsyncClient, auth_headers: dict):
    response = await client.get("/api/auth/me", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "test_developer"
    assert "id" in data

@pytest.mark.asyncio
async def test_get_me_unauthorized(client: AsyncClient):
    response = await client.get("/api/auth/me")
    assert response.status_code == 401
