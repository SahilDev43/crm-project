from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.common.dependencies import get_db
from app.common.exceptions import PermissionDeniedError
from app.core.jwt import get_current_user
from app.modules.permissions.repository import PermissionRepository
from app.modules.permissions.service import PermissionService
from app.modules.users.repository import UserRepository
from app.db.unit_of_work import UnitOfWork
from app.db.dependencies import get_uow

def get_permission_repository(
    db: AsyncSession = Depends(get_db)
) -> PermissionRepository:
    return PermissionRepository(db)

def get_user_repository(
    db: AsyncSession = Depends(get_db)
) -> UserRepository:
    return UserRepository(db)

def get_permission_service(
    permission_repo: PermissionRepository = Depends(
        get_permission_repository
    ),
    user_repo: UserRepository = Depends(
        get_user_repository
    ),
    uow: UnitOfWork = Depends(get_uow)
) -> PermissionService:

    return PermissionService(
        permission_repo=permission_repo,
        user_repo=user_repo,
        uow=uow
    )

def require_permission(permission: str):

    async def checker(
        current_user=Depends(get_current_user),
    ):

        if not current_user.role:
            raise PermissionDeniedError()

        permissions = {
            rp.permission.name
            for rp in current_user.role.role_permissions
        }

        if permission not in permissions:
            raise PermissionDeniedError()

        return current_user

    return checker