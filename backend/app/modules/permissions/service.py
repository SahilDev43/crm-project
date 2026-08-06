from app.modules.permissions.repository import PermissionRepository
from app.modules.users.repository import UserRepository
from app.db.unit_of_work import UnitOfWork
from app.modules.permissions.model import Permission
from app.modules.permissions.schema import PermissionCreate, PermissionUpdate
from app.common.exceptions import PermissionAlreadyExistsError, PermissionNotFoundError

class PermissionService:
    """Service for permission-related business logic."""

    def __init__(self, permission_repo: PermissionRepository, user_repo: UserRepository, uow: UnitOfWork):

        self.permission_repo = permission_repo
        self.user_repo = user_repo
        self.uow = uow

    async def create_permission(self, data: PermissionCreate) -> Permission:

        existing = await self.permission_repo.get_by_name(data.name)

        if existing:
            raise PermissionAlreadyExistsError()

        permission = Permission(
            name=data.name,
            description=data.description
        )

        async with self.uow:
            await self.permission_repo.create(permission)
            await self.permission_repo.flush()

        await self.permission_repo.refresh(permission)

        return permission

    async def has_permission(
            self,
            user_id: int,
            permission_name: str
    ) -> bool:

        """Check whether a user has a specific permission"""

        user = await self.user_repo.get_by_id(user_id)

        if not user:
            return False

        if not user.role_id:
            return False

        permission = await self.permission_repo.get_by_role_id(
            user.role_id
        )

        permission_names = {
            p.name for p in permission
        }

        return permission_name in permission_names

    async def get_permission(self, permission_id: int) -> Permission:

        permission = await self.permission_repo.get_by_id(permission_id)

        if not permission:
            raise PermissionNotFoundError()

        return permission

    async def get_permissions(self) -> list[Permission]:

        return await self.permission_repo.get_all()

    async def update_permission(
        self,
        permission_id: int,
        data: PermissionUpdate
    ) -> Permission:

        permission = await self.permission_repo.get_by_id(permission_id)

        if not permission:
            raise PermissionNotFoundError()

        update_data = data.model_dump(exclude_unset=True)

        if "name" in update_data:
            existing = await self.permission_repo.get_by_name(update_data["name"])

            if existing and existing.id != permission_id:
                raise PermissionAlreadyExistsError()

        for field, value in update_data.items():
            setattr(permission, field, value)

        async with self.uow:
            await self.permission_repo.flush()

        await self.permission_repo.refresh(permission)

        return permission

    async def delete_permission(self, permission_id: int) -> None:

        permission = await self.permission_repo.get_by_id(permission_id)

        if not permission:
            raise PermissionNotFoundError()

        async with self.uow:
            await self.permission_repo.delete(permission)
            await self.permission_repo.flush()