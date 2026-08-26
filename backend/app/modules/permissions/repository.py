from sqlalchemy import func, select

from app.db.base_repository import BaseRepository
from app.modules.permissions.model import Permission


class PermissionRepository(BaseRepository):

    async def get_by_id(
        self,
        permission_id: int,
    ) -> Permission | None:

        result = await self.db.execute(
            select(Permission).where(
                Permission.id == permission_id
            )
        )

        return result.scalar_one_or_none()

    async def get_by_name(
        self,
        name: str,
    ) -> Permission | None:

        result = await self.db.execute(
            select(Permission).where(
                Permission.name == name
            )
        )

        return result.scalar_one_or_none()

    async def create(
        self,
        permission: Permission
    ) -> Permission:

        self.db.add(permission)

        return permission

    async def get_all(
        self,
        search: str | None = None,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[list[Permission], int]:

        query = select(Permission)

        if search:
            search_value = f"%{search.strip()}%"

            query = query.where(
                Permission.name.ilike(search_value)
                | Permission.description.ilike(search_value)
            )

        count_query = select(
            func.count()
        ).select_from(query.subquery())

        count_result = await self.db.execute(count_query)

        total = count_result.scalar_one()

        offset = (page - 1) * page_size

        query = (
            query
            .order_by(Permission.id)
            .offset(offset)
            .limit(page_size)
        )

        result = await self.db.execute(query)

        items = list(result.scalars().all())

        return items, total

    async def delete(
        self,
        permission: Permission
    ) -> None:

        await self.db.delete(permission)