from sqlalchemy import select

from app.db.base_repository import BaseRepository
from app.modules.role_permissions.model import RolePermission

class RolePermissionRepository(BaseRepository):

    async def get(
        self,
        role_id: int,
        permission_id: int,
    ) -> RolePermission | None:

        result = await self.db.execute(
            select(RolePermission).where(
                RolePermission.role_id == role_id,
                RolePermission.permission_id == permission_id
            )
        )

        return result.scalar_one_or_none()

    async def get_by_role(
        self,
        role_id: int,
    ) -> list[RolePermission]:

        result = await self.db.execute(
            select(RolePermission).where(
                RolePermission.role_id == role_id
            )
        )

        return list(result.scalars().all())

    async def assign(
        self,
        role_permission: RolePermission
    ) -> RolePermission:

        self.db.add(role_permission)

        return role_permission

    async def remove(
        self,
        role_permission: RolePermission
    ) -> None:

        await self.db.delete(role_permission)