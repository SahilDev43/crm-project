from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.dependencies import get_db
from app.db.dependencies import get_uow
from app.db.unit_of_work import UnitOfWork
from app.modules.companies.repository import CompanyRepository
from app.modules.companies.service import CompanyService
from app.common.storage import StorageService

def get_company_repository(db: AsyncSession = Depends(get_db)) -> CompanyRepository:
    return CompanyRepository(db)

def get_storage_service() -> StorageService:
    return StorageService()

def get_company_service(
    repo: CompanyRepository = Depends(get_company_repository),
    uow: UnitOfWork = Depends(get_uow),
    storage: StorageService = Depends(get_storage_service),
) -> CompanyService:

    return CompanyService(
        repo=repo,
        uow=uow,
        storage=storage,
    )
