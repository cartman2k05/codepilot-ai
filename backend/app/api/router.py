from fastapi import APIRouter
from app.api.auth import router as auth_router
from app.api.reviews import router as reviews_router
from app.api.feedback import router as feedback_router
from app.api.repositories import router as repositories_router
from app.api.memory import router as memory_router
from app.api.audit import router as audit_router
from app.api.dashboard import router as dashboard_router

api_router = APIRouter()

api_router.include_router(auth_router, prefix="/auth", tags=["Auth"])
api_router.include_router(reviews_router, prefix="/reviews", tags=["Reviews"])
api_router.include_router(feedback_router, prefix="/feedback", tags=["Feedback"])
api_router.include_router(repositories_router, prefix="/repositories", tags=["Repositories"])
api_router.include_router(memory_router, prefix="/memory", tags=["Memory"])
api_router.include_router(audit_router, prefix="/audit", tags=["Audit"])
api_router.include_router(dashboard_router, prefix="/dashboard", tags=["Dashboard"])
