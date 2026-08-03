from sqlalchemy import select

from app.db.base_repository import BaseRepository
from app.modules.roles.model import Role

class RoleRepository(BaseRepository):

    async def get_by_id(self, role_id: int) -> Role | None:
        result = await self.db.execute(
            select(Role).where(Role.id == role_id)
        )
        return result.scalar_one_or_none()

    async def get_by_name(self, name: str) -> Role | None:
        result = await self.db.execute(
            select(Role).where(Role.name == name)
        )
        return result.scalar_one_or_none()

    async def get_all(self) -> list[Role]:
        result = await self.db.execute(
            select(Role).order_by(Role.id)
        )

        return list(result.scalars().all())

    async def create(self, role: Role) -> Role:
        self.db.add(role)
        return role

    async def update(self, role: Role) -> Role:
        return role

    async def delete(self, role: Role) -> None:
        await self.db.delete(role)