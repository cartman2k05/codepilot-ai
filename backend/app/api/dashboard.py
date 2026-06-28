from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.dashboard import DashboardResponse
from app.services.dashboard_service import dashboard_service

router = APIRouter()

@router.get("/", response_model=DashboardResponse)
async def get_dashboard_data(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Consolidated endpoint returning all main KPIs, cost savings charts, 
    recent submissions, and learning audit timeline feeds in one call.
    """
    return await dashboard_service.get_dashboard(db, current_user.id)
