from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.permissions.model import Permission
from app.modules.role_permissions.model import RolePermission
from app.modules.roles.model import Role
from app.seeders.base import BaseSeeder

class RolePermissionSeeder(BaseSeeder):
    """Assign permissions to default roles."""

    async def run(seld, db: AsyncSession) -> None:

        result = await db.execute(
            select(Role).where(Role.name == "Admin")
        )

        admin_role = result.scalar_one_or_none()

        if not admin_role:
            raise ValueError("Admin role not found")

        result = await db.execute(
            select(Permission)
        )

        permissions = result.scalars().all()

        for permission in permissions:

            result = await db.execute(
                select(RolePermission).where(
                    RolePermission.role_id == admin_role.id,
                    RolePermission.permission_id == permission.id
                )
            )

            exists = result.scalar_one_or_none()

            if exists:
                continue

            db.add(
                RolePermission(
                    role_id=admin_role.id,
                    permission_id=permission.id
                )
            )

        await db.commit()