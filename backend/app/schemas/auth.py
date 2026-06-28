from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field

class DemoLoginRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=50, examples=["developer_steve"])

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    avatar_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class DemoLoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class TokenPayload(BaseModel):
    sub: str
    exp: int
