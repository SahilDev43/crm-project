import hashlib
import secrets

from app.db.unit_of_work import UnitOfWork
from app.modules.companies.api_key_model import CompanyApiKey
from app.modules.companies.api_key_repository import CompanyApiKeyRepository
from app.modules.companies.api_key_schema import CompanyApiKeyCreate
from app.modules.companies.repository import CompanyRepository
from app.common.exceptions import CompanyNotFoundError, CompanyApiKeyNotFoundError


class CompanyApiKeyService:

    def __init__(
        self,
        repo: CompanyApiKeyRepository,
        company_repo: CompanyRepository,
        uow: UnitOfWork,
    ):
        self.repo = repo
        self.company_repo = company_repo
        self.uow = uow

    @staticmethod
    def _hash_key(api_key: str) -> str:
        return hashlib.sha256(
            api_key.encode("utf-8")
        ).hexdigest()

    async def create_api_key(
        self,
        company_id: int,
        data: CompanyApiKeyCreate,
    ) -> tuple[CompanyApiKey, str]:

        company = await self.company_repo.get_by_id(company_id)

        if not company:
            raise CompanyNotFoundError()

        # Public part used for DB lookup
        prefix_random = secrets.token_hex(4)
        key_prefix = f"crm_{prefix_random}"

        # Secret part
        secret = secrets.token_urlsafe(32)

        # Complete key shown to user only once
        plain_api_key = f"{key_prefix}_{secret}"

        api_key = CompanyApiKey(
            company_id=company_id,
            name=data.name,
            key_prefix=key_prefix,
            key_hash=self._hash_key(plain_api_key),
            is_active=True,
        )

        async with self.uow:
            await self.repo.create(api_key)
            await self.repo.flush()

        await self.repo.refresh(api_key)

        return api_key, plain_api_key

    async def get_company_api_keys(
        self,
        company_id: int,
    ) -> list[CompanyApiKey]:

        company = await self.company_repo.get_by_id(company_id)

        if not company:
            raise CompanyNotFoundError()

        return await self.repo.get_by_company(company_id)

    async def revoke_api_key(
        self,
        company_id: int,
        key_id: int,
    ) -> CompanyApiKey:

        company = await self.company_repo.get_by_id(company_id)

        if not company:
            raise CompanyNotFoundError()

        api_key = await self.repo.get_by_id(key_id)

        if (
            not api_key
            or api_key.company_id != company_id
        ):
            raise CompanyApiKeyNotFoundError()
        async with self.uow:
            await self.repo.deactivate(api_key)
            await self.repo.flush()

        await self.repo.refresh(api_key)

        return api_key

    async def authenticate_api_key(
        self,
        plain_api_key: str,
    ) -> CompanyApiKey | None:

        parts = plain_api_key.split("_", 2)

        if len(parts) != 3:
            return None

        key_prefix = f"{parts[0]}_{parts[1]}"

        api_key = await self.repo.get_by_prefix(key_prefix)

        if not api_key:
            return None

        provided_hash = self._hash_key(plain_api_key)

        if not secrets.compare_digest(
            provided_hash,
            api_key.key_hash,
        ):
            return None

        return api_key