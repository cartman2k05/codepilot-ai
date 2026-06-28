from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User

async def create_user(
    db: AsyncSession,
    username: str,
    email: str,
    avatar_url: Optional[str] = None
) -> User:
    db_user = User(
        username=username,
        email=email,
        avatar_url=avatar_url
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user

async def get_user_by_id(db: AsyncSession, user_id: int) -> Optional[User]:
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()

async def get_user_by_username(db: AsyncSession, username: str) -> Optional[User]:
    result = await db.execute(select(User).where(User.username == username))
    return result.scalar_one_or_none()

async def get_or_create_user(
    db: AsyncSession,
    username: str,
    email: str
) -> User:
    user = await get_user_by_username(db, username)
    if not user:
        user = await create_user(
            db,
            username=username,
            email=email,
            avatar_url=f"https://api.dicebear.com/7.x/bottts/svg?seed={username}"
        )
    return user
