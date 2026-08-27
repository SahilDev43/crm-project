from app.db.unit_of_work import UnitOfWork
from app.modules.companies.repository import CompanyRepository
from app.modules.leads.model import Lead
from app.modules.leads.repository import LeadRepository
from app.modules.leads.public_schema import PublicLeadCreate
from app.common.exceptions import (
    CompanyNotFoundError,
    CompanyInactiveError,
    LeadNotFoundError,
    LeadAlreadyExistsError,
    DefaultLeadStatusNotFoundError,
)
import math

class LeadService:

    def __init__(
        self,
        repo: LeadRepository,
        company_repo: CompanyRepository,
        uow: UnitOfWork,
    ):
        self.repo = repo
        self.company_repo = company_repo
        self.uow = uow

    async def get_leads(
        self,
        company_id: int | None = None,
        status_id: int | None = None,
        lead_type: str | None = None,
        search: str | None = None,
        page: int = 1,
        page_size: int = 10,
    ) -> dict:
        leads, total = await self.repo.get_all(
            company_id=company_id,
            status_id=status_id,
            lead_type=lead_type,
            search=search,
            page=page,
            page_size=page_size,
        )

        return {
            "items": leads,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": math.ceil(total / page_size) if total else 0,
        }


    async def get_lead(
        self,
        lead_id: int,
    ) -> Lead:

        lead = await self.repo.get_by_id(lead_id)

        if not lead:
            raise LeadNotFoundError()

        return lead

    async def delete_lead(
        self,
        lead_id: int,
    ) -> None:

        lead = await self.repo.get_by_id(lead_id)

        if not lead:
            raise LeadNotFoundError()

        async with self.uow:
            await self.repo.delete(lead)
            await self.repo.flush()

    async def get_statuses(self):
        return await self.repo.get_all_statuses()

    async def create_public_lead(
        self,
        company_id: int,
        data: PublicLeadCreate
    ) -> Lead:

        company = await self.company_repo.get_by_id(company_id)

        if not company:
            raise CompanyNotFoundError()

        if not company.is_active:
            raise CompanyInactiveError()

        if data.external_lead_id:
            existing = await self.repo.get_by_external_id(
                company_id=company_id,
                external_lead_id=data.external_lead_id
            )

            if existing:
                raise DefaultLeadStatusNotFoundError()

        status = await self.repo.get_status_by_code("new")

        if not status:
            raise DefaultLeadStatusNotFoundError()

        lead = Lead(
            **data.model_dump(),
            company_id=company_id,
            status_id=status.id
        )

        async with self.uow:
            await self.repo.create(lead)
            await self.repo.flush()

        lead = await self.repo.get_by_id(lead.id)

        return lead
