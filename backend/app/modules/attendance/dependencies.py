from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.dependencies import get_db
from app.db.dependencies import get_uow
from app.db.unit_of_work import UnitOfWork

from app.modules.attendance.repository import AttendanceRepository
from app.modules.attendance.service import AttendanceService

from app.modules.users.repository import UserRepository
from app.modules.users.dependencies import get_user_repository


def get_attendance_repository(
    db: AsyncSession = Depends(get_db),
) -> AttendanceRepository:
    return AttendanceRepository(db)


def get_attendance_service(
    repo: AttendanceRepository = Depends(
        get_attendance_repository
    ),
    user_repo: UserRepository = Depends(
        get_user_repository
    ),
    uow: UnitOfWork = Depends(get_uow),
) -> AttendanceService:

    return AttendanceService(
        repo=repo,
        uow=uow,
        user_repo=user_repo,
    )