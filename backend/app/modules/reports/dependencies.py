from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.dependencies import get_db
from app.modules.reports.repository import ReportRepository
from app.modules.reports.service import ReportService
from app.modules.users.dependencies import get_user_repository
from app.modules.users.repository import UserRepository


def get_report_repository(
    db: AsyncSession = Depends(get_db),
) -> ReportRepository:
    return ReportRepository(db)


def get_report_service(
    repo: ReportRepository = Depends(get_report_repository),
    user_repo: UserRepository = Depends(get_user_repository),
) -> ReportService:
    return ReportService(repo=repo, user_repo=user_repo)
