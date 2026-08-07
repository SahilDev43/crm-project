from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.dependencies import get_db
from app.db.dependencies import get_uow
from app.db.unit_of_work import UnitOfWork

from app.modules.leads.repository import LeadRepository
from app.modules.leads.service import LeadService

from app.modules.companies.repository import CompanyRepository
from app.modules.companies.dependencies import get_company_repository


def get_lead_repository(
    db: AsyncSession = Depends(get_db),
) -> LeadRepository:
    return LeadRepository(db)


def get_lead_service(
    repo: LeadRepository = Depends(get_lead_repository),
    company_repo: CompanyRepository = Depends(get_company_repository),
    uow: UnitOfWork = Depends(get_uow),
) -> LeadService:

    return LeadService(
        repo=repo,
        company_repo=company_repo,
        uow=uow,
    )