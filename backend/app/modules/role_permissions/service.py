from app.common.exceptions import (
    PermissionNotFoundError,
    RoleNotFoundError,
    RolePermissionAlreadyExistsError,
    RolePermissionNotFoundError
)

from app.db.unit_of_work import UnitOfWork
from app.modules.permissions.repository import PermissionRepository
from app.modules.roles.repository import RoleRepository
from app.modules.role_permissions.model import RolePermission
from app.modules.role_permissions.repository import RolePermissionRepository


class RolePermissionService:
    def __init__(
        self,
        role_repo: RoleRepository,
        permission_repo: PermissionRepository,
        role_permission_repo: RolePermissionRepository,
        uow: UnitOfWork
    ):

        self.role_repo = role_repo
        self.permission_repo = permission_repo
        self.role_permission_repo = role_permission_repo
        self.uow = uow

    async def assign_permission(
        self,
        role_id: int,
        permission_id: int
    ) -> RolePermission:

        role = await self.role_repo.get_by_id(role_id)

        if not role:
            raise RoleNotFoundError()

        permission = await self.permission_repo.get_by_id(permission_id)

        if not permission:
            raise PermissionNotFoundError()


        existing = await self.role_permission_repo.get(
            role_id=role_id,
            permission_id=permission_id
        )

        if existing:
            raise RolePermissionAlreadyExistsError()

        role_permission = RolePermission(
            role_id=role_id,
            permission_id=permission_id
        )

        async with self.uow:
            await self.role_permission_repo.assign(role_permission)
            await self.role_permission_repo.flush()

        await self.role_permission_repo.refresh(role_permission)

        return role_permission

    async def remove_permission(
            self,
            role_id: int,
            permission_id: int
    ) -> None:

        role = await self.role_repo.get_by_id(role_id)

        if not role:
            raise RoleNotFoundError()

        permission = await self.permission_repo.get_by_id(permission_id)

        if not permission:
            raise PermissionNotFoundError()

        role_permission = await self.role_permission_repo.get(
            role_id=role_id,
            permission_id=permission_id
        )

        if not role_permission:
            raise RolePermissionNotFoundError()

        async with self.uow:
            await self.role_permission_repo.remove(role_permission)
            await self.role_permission_repo.flush()

    async def get_role_permissions(
        self,
        role_id: int,
    ):

        role = await self.role_repo.get_by_id(role_id)

        if not role:
            raise RoleNotFoundError()

        role_permissions = await self.role_permission_repo.get_by_role(role_id)

        return [
            role_permission.permission
            for role_permission in role_permissions
        ]