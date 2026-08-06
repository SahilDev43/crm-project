from sqlalchemy import select

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

    async def get_all(self) -> list[Permission]:

        result = await self.db.execute(
            select(Permission).order_by(Permission.id)
        )

        return list(result.scalars().all())

    async def delete(
        self,
        permission: Permission
    ) -> None:

        await self.db.delete(permission)