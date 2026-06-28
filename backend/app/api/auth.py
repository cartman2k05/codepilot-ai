from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.auth import DemoLoginRequest, DemoLoginResponse, UserResponse
from app.services import auth_service

router = APIRouter()

@router.post("/demo-login", response_model=DemoLoginResponse)
async def demo_login_endpoint(
    payload: DemoLoginRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Simulated OAuth OAuth bypass: Registers or fetches user profile from username 
    and returns a valid JWT signature.
    """
    return await auth_service.demo_login(db, payload.username)

@router.get("/me", response_model=UserResponse)
async def get_me(
    current_user: User = Depends(get_current_user)
):
    """Returns current active user session profile info."""
    return UserResponse(
        id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        avatar_url=current_user.avatar_url,
        created_at=current_user.created_at
    )
