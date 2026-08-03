from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.dependencies import get_db
from app.db.dependencies import get_uow
from app.db.unit_of_work import UnitOfWork

from app.modules.roles.repository import RoleRepository
from app.modules.roles.service import RoleService

def get_role_repository(db: AsyncSession = Depends(get_db)) -> RoleRepository:
    return RoleRepository(db)

def get_role_service(
        repo: RoleRepository = Depends(get_role_repository),
        uow: UnitOfWork = Depends(get_uow)
) -> RoleService:
    return RoleService(
        repo=repo,
        uow=uow
    )