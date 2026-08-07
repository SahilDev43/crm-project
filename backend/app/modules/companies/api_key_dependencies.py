from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.dependencies import get_db
from app.db.dependencies import get_uow
from app.db.unit_of_work import UnitOfWork

from app.modules.companies.repository import CompanyRepository
from app.modules.companies.dependencies import get_company_repository

from app.modules.companies.api_key_repository import CompanyApiKeyRepository
from app.modules.companies.api_key_service import CompanyApiKeyService


def get_company_api_key_repository(
    db: AsyncSession = Depends(get_db),
) -> CompanyApiKeyRepository:
    return CompanyApiKeyRepository(db)


def get_company_api_key_service(
    repo: CompanyApiKeyRepository = Depends(
        get_company_api_key_repository
    ),
    company_repo: CompanyRepository = Depends(
        get_company_repository
    ),
    uow: UnitOfWork = Depends(get_uow),
) -> CompanyApiKeyService:

    return CompanyApiKeyService(
        repo=repo,
        company_repo=company_repo,
        uow=uow,
    )