from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.exceptions import RoleNotFoundError
from app.modules.permissions.model import Permission
from app.modules.role_permissions.model import RolePermission
from app.modules.roles.model import Role
from app.seeders.base import BaseSeeder

class RolePermissionSeeder(BaseSeeder):
    """Assign permissions to default roles."""

    # Non-admin roles get a curated permission set so the role-based
    # dashboard has authoritative, backend-enforced data to show.  Admin
    # keeps every permission (assigned below).
    ROLE_PERMISSIONS = {
        "HR": [
            "attendance.manage",
            "users.view",
            "reports.view",
            "reports.attendance",
        ],
        "Manager": [
            "reports.view",
            "reports.sales",
            "reports.performance",
            "reports.export",
        ],
        "Sales": [
            "reports.view",
            "reports.export",
        ],
    }

    async def _assign(
        self,
        db: AsyncSession,
        role_id: int,
        permission_id: int,
    ) -> None:

        exists = (
            await db.execute(
                select(RolePermission).where(
                    RolePermission.role_id == role_id,
                    RolePermission.permission_id == permission_id,
                )
            )
        ).scalar_one_or_none()

        if exists:
            return

        db.add(
            RolePermission(
                role_id=role_id,
                permission_id=permission_id,
            )
        )

    async def run(self, db: AsyncSession) -> None:

        result = await db.execute(
            select(Role).where(Role.name == "Admin")
        )

        admin_role = result.scalar_one_or_none()

        if not admin_role:
            raise RoleNotFoundError()

        permissions = (
            await db.execute(select(Permission))
        ).scalars().all()

        permission_by_name = {
            permission.name: permission for permission in permissions
        }

        for permission in permissions:
            await self._assign(db, admin_role.id, permission.id)

        # Curated sets for the other default roles.
        for role_name, permission_names in self.ROLE_PERMISSIONS.items():

            role = (
                await db.execute(
                    select(Role).where(Role.name == role_name)
                )
            ).scalar_one_or_none()

            if not role:
                continue

            for permission_name in permission_names:

                permission = permission_by_name.get(permission_name)

                if permission is None:
                    continue

                await self._assign(db, role.id, permission.id)

        await db.commit()