from sqlalchemy import cast, func, select, String
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
            .where(User.id == user_id, User.is_deleted.is_(False))
        )
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> User | None:
        result = await self.db.execute(
            select(User).where(User.email == email, User.is_deleted.is_(False))
        )
        return result.scalar_one_or_none()

    async def get_all(
        self,
        search: str | None = None,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[list[User], int]:

        query = (
            select(User)
            .outerjoin(Role, User.role_id == Role.id)
            .where(User.is_deleted.is_(False))
        )

        if search:
            search_value = f"%{search.strip()}%"

            query = query.where(
                User.first_name.ilike(search_value)
                | User.last_name.ilike(search_value)
                | User.email.ilike(search_value)
                | User.phone.ilike(search_value)
                | Role.name.ilike(search_value)
                | cast(User.id, String).ilike(search_value)
            )

        count_query = select(
            func.count()
        ).select_from(query.subquery())

        count_result = await self.db.execute(count_query)

        total = count_result.scalar_one()

        offset = (page - 1) * page_size

        query = (
            query
            .order_by(User.id)
            .offset(offset)
            .limit(page_size)
        )

        result = await self.db.execute(query)

        items = list(result.scalars().all())

        return items, total

    async def create(self, user: User) -> User:
        self.db.add(user)
        return user

    async def update(self, user: User) -> User:
        return user

    async def delete(self, user: User) -> None:
        user.is_deleted = True
        user.is_active = False

        return user