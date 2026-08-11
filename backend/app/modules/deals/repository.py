from sqlalchemy import select
from app.db.base_repository import BaseRepository
from app.modules.deals.model import Deal

class DealRepository(BaseRepository):

    async def get_by_id(self, deal_id: int) -> Deal | None:
        result = await self.db.execute(
            select(Deal).where(Deal.id == deal_id)
        )

        return result.scalar_one_or_none()

    async def get_all(self) -> list[Deal]:
        result = await self.db.execute(
         select(Deal).order_by(Deal.id)   
        )

        return list(result.scalars().all())

    async def create(self, deal: Deal) -> Deal:
        self.db.add(deal)
        return deal

    async def update(self, deal: Deal) -> Deal:
        return deal

    async def delete(self, deal: Deal) -> None:
        await self.db.delete(deal)