from sqlalchemy import select, func, or_
from app.db.base_repository import BaseRepository
from app.modules.deals.model import Deal

class DealRepository(BaseRepository):

    async def get_by_id(self, deal_id: int) -> Deal | None:
        result = await self.db.execute(
            select(Deal).where(Deal.id == deal_id)
        )

        return result.scalar_one_or_none()

    async def get_all(
        self,
        company_id: int | None = None,
        deal_status_id: int | None = None,
        platform_id: int | None = None,
        project_type_id: int | None = None,
        assigned_to: int | None = None,
        search: str | None = None,
        page: int = 1,
        page_size: int = 10
    ) -> tuple[list[Deal], int]:

        query = select(Deal)

        count_query = select(func.count()).select_from(Deal)

        # Filters

        if company_id is not None:
            query = query.where(Deal.company_id == company_id)
            count_query = count_query.where(Deal.company_id == company_id)

        if deal_status_id is not None:
            query = query.where(
                Deal.deal_status_id == deal_status_id
            )
            count_query = count_query.where(
                Deal.deal_status_id == deal_status_id
            )

        if platform_id is not None:
            query = query.where(
                Deal.platform_id == platform_id
            )
            count_query = count_query.where(
                Deal.platform_id == platform_id
            )

        if project_type_id is not None:
            query = query.where(
                Deal.project_type_id == project_type_id
            )
            count_query = count_query.where(
                Deal.project_type_id == project_type_id
            )

        if assigned_to is not None:
            query = query.where(
                Deal.assigned_to == assigned_to
            )
            count_query = count_query.where(
                Deal.assigned_to == assigned_to
            )

        if search:
            search_term = f"%{search.strip()}%"

            search_filter = or_(
                Deal.title.ilike(search_term),
                Deal.client_name.ilike(search_term),
                Deal.client_email.ilike(search_term),
                Deal.client_phone.ilike(search_term),
                Deal.external_lead_id.ilike(search_term)
            )

            query = query.where(search_filter)
            count_query = count_query.where(search_filter)

        # Total records
        total_results = await self.db.execute(count_query)
        total = total_results.scalar_one()

        # Pagination
        offset = (page - 1) * page_size

        query = query.order_by(Deal.id).offset(offset).limit(page_size)

        result = await self.db.execute(query)

        deals = list(result.scalars().all())

        return deals, total

    async def create(self, deal: Deal) -> Deal:
        self.db.add(deal)
        return deal

    async def update(self, deal: Deal) -> Deal:
        return deal

    async def delete(self, deal: Deal) -> None:
        await self.db.delete(deal)