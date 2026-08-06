from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.permissions.model import Permission
from app.seeders.base import BaseSeeder

class PermissionSeeder(BaseSeeder):
    """Seeder for default permissions."""

    DEFAULT_PERMISSIONS = [
        #Users
        {
            "name": "users.view",
            "description": "View users"
        },
        {
            "name": "users.create",
            "description": "Create users"
        },
        {
            "name": "users.update",
            "description": "Update users"
        },
        {
            "name": "users.delete",
            "description": "Delete users"
        },

        #Roles
        {
            "name": "roles.view",
            "description": "View Roles"
        },
        {
            "name": "roles.create",
            "description": "Create roles"
        },
        {
            "name": "roles.update",
            "description": "Update roles"
        },
        {
            "name": "roles.delete",
            "description": "Delete roles"
        },

        #Permissions
        {
            "name": "permissions.view",
            "description": "View permissions"
        },
        {
            "name": "permissions.assign",
            "description": "Assign permissions"
        },
        {
            "name": "permissions.create",
            "description": "Create permissions"
        },
        {
            "name": "permissions.update",
            "description": "Update permissions"
        },
        {
            "name": "permissions.delete",
            "description": "Delete permissions"
        }
    ]

    async def run(self,db: AsyncSession) -> None:
        for permission_data in self.DEFAULT_PERMISSIONS:

            result = await db.execute(
                select(Permission).where(Permission.name == permission_data["name"])
            )

            permission = result.scalar_one_or_none()

            if permission:
                continue

            db.add(Permission(**permission_data))

        await db.commit()