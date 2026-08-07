from app.db.unit_of_work import UnitOfWork
from app.modules.companies.repository import CompanyRepository
from app.modules.leads.model import Lead
from app.modules.leads.repository import LeadRepository
from app.modules.leads.schema import LeadCreate, LeadUpdate
from app.common.exceptions import (
    CompanyNotFoundError,
    CompanyInactiveError,
    LeadNotFoundError,
    LeadAlreadyExistsError,
    LeadStatusNotFoundError,
    DefaultLeadStatusNotFoundError,
)

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

    async def create_lead(
        self,
        data: LeadCreate,
    ) -> Lead:

        # Validate company
        company = await self.company_repo.get_by_id(
            data.company_id
        )

        if not company:
            raise CompanyNotFoundError()

        if not company.is_active:
            raise CompanyInactiveError()

        # Prevent duplicate external leads
        if data.external_lead_id:

            existing = await self.repo.get_by_external_id(
                company_id=data.company_id,
                external_lead_id=data.external_lead_id,
            )

            if existing:
                raise LeadAlreadyExistsError()

        # Automatically assign "new" status
        status = await self.repo.get_status_by_code("new")

        if not status:
            raise DefaultLeadStatusNotFoundError()

        lead = Lead(
            **data.model_dump(),
            status_id=status.id,
        )

        async with self.uow:
            await self.repo.create(lead)
            await self.repo.flush()

        # Reload relationships for LeadResponse
        lead = await self.repo.get_by_id(lead.id)

        return lead

    async def get_leads(self) -> list[Lead]:
        return await self.repo.get_all()


    async def get_lead(
        self,
        lead_id: int,
    ) -> Lead:

        lead = await self.repo.get_by_id(lead_id)

        if not lead:
            raise LeadNotFoundError()

        return lead

    async def update_lead(
        self,
        lead_id: int,
        data: LeadUpdate,
    ) -> Lead:

        lead = await self.repo.get_by_id(lead_id)

        if not lead:
            raise LeadNotFoundError()

        update_data = data.model_dump(
            exclude_unset=True
        )

        # Validate status if changing it
        if (
            "status_id" in update_data
            and update_data["status_id"] is not None
        ):
            status = await self.repo.get_status_by_id(
                update_data["status_id"]
            )

            if not status:
                raise LeadStatusNotFoundError()

        for field, value in update_data.items():
            setattr(lead, field, value)

        async with self.uow:
            await self.repo.flush()

        lead = await self.repo.get_by_id(lead.id)

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