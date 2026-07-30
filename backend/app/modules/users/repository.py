from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.users.model import User
from sqlalchemy.orm import selectinload
from app.modules.roles.model import Role
from app.modules.role_permissions.model import RolePermission
from app.db.base_repository import BaseRepository

class UserRepository(BaseRepository):

    async def get_by_id(self, user_id: int) -> User | None:
        result = await self.db.execute(
            select(User)
            .options(
                selectinload(User.role)
                .selectinload(Role.role_permissions)
                .selectinload(RolePermission.permission)
            )
            .where(User.id == user_id)
        )
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> User | None:
        result = await self.db.execute(
            select(User).where(User.email == email)
        )
        return result.scalar_one_or_none()

    async def get_all(self) -> list[User]:
        result = await self.db.execute(select(User))
        return list(result.scalars().all())

    async def create(self, user: User) -> User:
        self.db.add(user)
        return user

    async def update(self, user: User) -> User:
        return user

    async def delete(self, user: User) -> None:
        await self.db.delete(user)