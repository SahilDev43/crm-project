from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.permissions.model import Permission
from app.modules.role_permissions.model import RolePermission

class PermissionRepository:

    def __init__(self, db: AsyncSession):
        self.db= db

    async def get_by_role_id(self, role_id: int) -> list[Permission]:
        result = await self.db.execute(
            select(Permission)
            .join(
                RolePermission,
                Permission.id == RolePermission.permission_id
            )
            .where(RolePermission.role_id == role_id)
        )

        return list(result.scalars().all())