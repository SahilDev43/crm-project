from sqlalchemy import select

from app.db.base_repository import BaseRepository
from app.modules.companies.api_key_model import CompanyApiKey


class CompanyApiKeyRepository(BaseRepository):

    async def get_by_id(
        self,
        key_id: int,
    ) -> CompanyApiKey | None:

        result = await self.db.execute(
            select(CompanyApiKey).where(
                CompanyApiKey.id == key_id
            )
        )

        return result.scalar_one_or_none()

    async def get_by_prefix(
        self,
        key_prefix: str,
    ) -> CompanyApiKey | None:

        result = await self.db.execute(
            select(CompanyApiKey).where(
                CompanyApiKey.key_prefix == key_prefix,
                CompanyApiKey.is_active.is_(True),
            )
        )

        return result.scalar_one_or_none()

    async def get_by_company(
        self,
        company_id: int,
    ) -> list[CompanyApiKey]:

        result = await self.db.execute(
            select(CompanyApiKey)
            .where(
                CompanyApiKey.company_id == company_id
            )
            .order_by(CompanyApiKey.id.desc())
        )

        return list(result.scalars().all())

    async def create(
        self,
        api_key: CompanyApiKey,
    ) -> CompanyApiKey:

        self.db.add(api_key)

        return api_key

    async def deactivate(
        self,
        api_key: CompanyApiKey,
    ) -> CompanyApiKey:

        api_key.is_active = False

        return api_key