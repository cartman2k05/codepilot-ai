from sqlalchemy.ext.asyncio import AsyncSession
from app.crud.users import get_or_create_user
from app.core.security import create_access_token
from app.schemas.auth import DemoLoginResponse, UserResponse

async def demo_login(db: AsyncSession, username: str) -> DemoLoginResponse:
    # 1. Get or create user
    email = f"{username}@codepilot.demo"
    user = await get_or_create_user(db, username=username, email=email)
    
    # 2. Create access token with sub as user.id
    token_data = {"sub": str(user.id)}
    access_token = create_access_token(data=token_data)
    
    user_response = UserResponse(
        id=user.id,
        username=user.username,
        email=user.email,
        avatar_url=user.avatar_url,
        created_at=user.created_at
    )
    
    return DemoLoginResponse(
        access_token=access_token,
        token_type="bearer",
        user=user_response
    )
