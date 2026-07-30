from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.roles.model import Role
from app.seeders.base import BaseSeeder

class RoleSeeder(BaseSeeder):
    """Seeder for default roles."""

    DEFAULT_ROLES = [
        {
            "name": "Admin",
            "description": "System Administrator",
        },
        {
            "name": "Manager",
            "description": "Team Manager",
        },
        {
            "name": "Sales",
            "description": "Sales Executive",
        },
        {
            "name": "HR",
            "description": "Human Resources",
        },
    ]

    async def run(self, db: AsyncSession) -> None:
        for roles_data in self.DEFAULT_ROLES:

            result = await db.execute(
                select(Role).where(Role.name == roles_data["name"])
            )

            role = result.scalar_one_or_none()

            if role:
                continue

            db.add(Role(**roles_data))

            await db.commit()