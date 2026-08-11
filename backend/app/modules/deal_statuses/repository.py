from sqlalchemy import select

from app.db.base_repository import BaseRepository
from app.modules.deal_statuses.model import DealStatus


class DealStatusRepository(BaseRepository):

    async def get_by_id(
        self,
        deal_status_id: int,
    ) -> DealStatus | None:

        result = await self.db.execute(
            select(DealStatus).where(
                DealStatus.id == deal_status_id,
                DealStatus.is_active.is_(True),
            )
        )

        return result.scalar_one_or_none()

    async def get_all(self) -> list[DealStatus]:

        result = await self.db.execute(
            select(DealStatus).where(
                DealStatus.is_active.is_(True)
            ).order_by(DealStatus.id)
        )

        return list(result.scalars().all())
