from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.dependencies import get_db
from app.db.dependencies import get_uow
from app.db.unit_of_work import UnitOfWork

from app.modules.roles.repository import RoleRepository
from app.modules.permissions.repository import PermissionRepository
from app.modules.role_permissions.repository import RolePermissionRepository
from app.modules.role_permissions.service import RolePermissionService

def get_role_repository(
    db: AsyncSession = Depends(get_db)
) -> RoleRepository:

    return RoleRepository(db)

def get_permission_repository(
        db: AsyncSession = Depends(get_db)
) -> PermissionRepository:
    return PermissionRepository(db)

def get_role_permission_repository(
    db: AsyncSession = Depends(get_db)
) -> RolePermissionRepository:
    return RolePermissionRepository(db)

def get_role_permission_service(
    role_repo: RoleRepository = Depends(get_role_repository),
    permission_repo: PermissionRepository = Depends(get_permission_repository),
    role_permission_repo: RolePermissionRepository = Depends(get_role_permission_repository),
    uow: UnitOfWork = Depends(get_uow)
) -> RolePermissionService:

    return RolePermissionService(
        role_repo=role_repo,
        permission_repo=permission_repo,
        role_permission_repo=role_permission_repo,
        uow=uow
    )