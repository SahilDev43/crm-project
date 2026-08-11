from sqlalchemy import select

from app.db.base_repository import BaseRepository
from app.modules.deal_platforms.model import DealPlatform


class DealPlatformRepository(BaseRepository):

    async def get_by_id(
        self,
        platform_id: int,
    ) -> DealPlatform | None:

        result = await self.db.execute(
            select(DealPlatform).where(
                DealPlatform.id == platform_id
            )
        )

        return result.scalar_one_or_none()

    async def get_all(self) -> list[DealPlatform]:

        result = await self.db.execute(
            select(DealPlatform).order_by(DealPlatform.id)
        )

        return list(result.scalars().all())
