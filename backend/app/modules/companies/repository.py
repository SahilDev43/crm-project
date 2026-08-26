from sqlalchemy import func, select
from app.db.base_repository import BaseRepository
from app.modules.companies.model import Company

class CompanyRepository(BaseRepository):

    async def get_by_id(self, company_id: int) -> Company | None:

        result = await self.db.execute(
            select(Company).where(
                Company.id == company_id,
                Company.is_deleted.is_(False) 
            )
        )

        return result.scalar_one_or_none()

    async def get_by_name(self, name: str) -> Company | None:

        result = await self.db.execute(select(Company).where(
            Company.name == name,
            Company.is_deleted.is_(False)
        ))

        return result.scalar_one_or_none()

    async def get_all(
        self,
        search: str | None = None,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[list[Company], int]:

        query = select(Company).where(
            Company.is_deleted.is_(False)
        )

        if search:
            search_value = f"%{search.strip()}%"

            query = query.where(
                Company.name.ilike(search_value)
                | Company.gst_number.ilike(search_value)
            )

        count_query = select(
            func.count()
        ).select_from(query.subquery())

        count_result = await self.db.execute(count_query)

        total = count_result.scalar_one()

        offset = (page - 1) * page_size

        query = (
            query
            .order_by(Company.id)
            .offset(offset)
            .limit(page_size)
        )

        result = await self.db.execute(query)

        items = list(result.scalars().all())

        return items, total

    async def create(self, comapny: Company) -> Company:

        self.db.add(comapny)
        return comapny

    async def delete(self, comapny: Company) -> Company:

        comapny.is_deleted = True
        comapny.is_active = False

        return comapny