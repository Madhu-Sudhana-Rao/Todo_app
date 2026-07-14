from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.auth.dependencies import get_current_user
from app.database.session import get_db
from app.models.user import User
from app.schemas.todo import DashboardStatsResponse
from app.services.todo import todo_service

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("", response_model=DashboardStatsResponse)
async def get_dashboard(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve numbers and logging lists for the dashboard metrics."""
    return await todo_service.get_dashboard_details(db, current_user.id)
