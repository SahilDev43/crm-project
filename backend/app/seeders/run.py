import asyncio

import app.db.models

from app.modules.users.model import User
from app.modules.roles.model import Role
from app.modules.permissions.model import Permission
from app.modules.role_permissions.model import RolePermission

from app.db.session import AsyncSessionFactory
from app.seeders.permission_seeder import PermissionSeeder
from app.seeders.role_permission_seeder import RolePermissionSeeder
from app.seeders.role_seeder import RoleSeeder

async def seed_database() -> None:
    async with AsyncSessionFactory() as db:

        print("Seeding roles...")
        await RoleSeeder().run(db)

        print("Seeding permissions...")
        await PermissionSeeder().run(db)

        print("Assigning permission to roles...")
        await RolePermissionSeeder().run(db)

        print("Database seeding completed successfully.")

if  __name__ == "__main__":
    asyncio.run(seed_database())