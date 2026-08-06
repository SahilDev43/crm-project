from sqlalchemy import select
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

    async def get_all(self) -> list[Company]:

        result = await self.db.execute(select(Company).where(
            Company.is_deleted.is_(False)
        ))

        return list(result.scalars().all())

    async def create(self, comapny: Company) -> Company:

        self.db.add(comapny)
        return comapny

    async def delete(self, comapny: Company) -> Company:

        comapny.is_deleted = True
        comapny.is_active = False

        return comapny