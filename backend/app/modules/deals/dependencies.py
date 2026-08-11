from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.dependencies import get_db
from app.db.dependencies import get_uow
from app.db.unit_of_work import UnitOfWork

from app.modules.deals.repository import DealRepository
from app.modules.deals.service import DealService

from app.modules.companies.repository import CompanyRepository
from app.modules.companies.dependencies import get_company_repository

from app.modules.leads.repository import LeadRepository
from app.modules.leads.dependencies import get_lead_repository

from app.modules.project_types.repository import ProjectTypeRepository
from app.modules.deal_platforms.repository import DealPlatformRepository
from app.modules.deal_statuses.repository import DealStatusRepository


def get_deal_repository(
    db: AsyncSession = Depends(get_db),
) -> DealRepository:
    return DealRepository(db)


def get_project_type_repository(
    db: AsyncSession = Depends(get_db),
) -> ProjectTypeRepository:
    return ProjectTypeRepository(db)


def get_deal_platform_repository(
    db: AsyncSession = Depends(get_db),
) -> DealPlatformRepository:
    return DealPlatformRepository(db)


def get_deal_status_repository(
    db: AsyncSession = Depends(get_db),
) -> DealStatusRepository:
    return DealStatusRepository(db)


def get_deal_service(
    repo: DealRepository = Depends(get_deal_repository),
    company_repo: CompanyRepository = Depends(get_company_repository),
    lead_repo: LeadRepository = Depends(get_lead_repository),
    project_type_repo: ProjectTypeRepository = Depends(
        get_project_type_repository
    ),
    platform_repo: DealPlatformRepository = Depends(
        get_deal_platform_repository
    ),
    deal_status_repo: DealStatusRepository = Depends(
        get_deal_status_repository
    ),
    uow: UnitOfWork = Depends(get_uow),
) -> DealService:

    return DealService(
        repo=repo,
        uow=uow,
        company_repo=company_repo,
        lead_repo=lead_repo,
        project_type_repo=project_type_repo,
        platform_repo=platform_repo,
        deal_status_repo=deal_status_repo,
    )