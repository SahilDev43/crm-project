from app.common.exceptions import (
    DealNotFoundError,
    CompanyNotFoundError,
    LeadNotFoundError,
    ProjectTypeNotFoundError,
    DealPlatformNotFoundError,
    DealStatusNotFoundError,
)

from app.modules.deals.model import Deal
from app.modules.deals.repository import DealRepository
from app.modules.deals.schema import DealCreate, DealUpdate

from app.modules.companies.repository import CompanyRepository
from app.modules.leads.repository import LeadRepository
from app.modules.project_types.repository import ProjectTypeRepository
from app.modules.deal_platforms.repository import DealPlatformRepository
from app.modules.deal_statuses.repository import DealStatusRepository

from app.db.unit_of_work import UnitOfWork


class DealService:

    def __init__(
        self,
        repo: DealRepository,
        uow: UnitOfWork,
        company_repo: CompanyRepository,
        lead_repo: LeadRepository,
        project_type_repo: ProjectTypeRepository,
        platform_repo: DealPlatformRepository,
        deal_status_repo: DealStatusRepository,
    ):
        self.repo = repo
        self.uow = uow
        self.company_repo = company_repo
        self.lead_repo = lead_repo
        self.project_type_repo = project_type_repo
        self.platform_repo = platform_repo
        self.deal_status_repo = deal_status_repo

    async def create_deal(
        self,
        data: DealCreate,
        current_user_id: int,
    ) -> Deal:

        # Validate company
        company = await self.company_repo.get_by_id(
            data.company_id
        )

        if not company:
            raise CompanyNotFoundError()

        if not company.is_active:
            raise CompanyNotFoundError()

        # Validate project type
        if data.project_type_id is not None:

            project_type = await self.project_type_repo.get_by_id(
                data.project_type_id
            )

            if not project_type:
                raise ProjectTypeNotFoundError()

        # Validate platform
        if data.platform_id is not None:

            platform = await self.platform_repo.get_by_id(
                data.platform_id
            )

            if not platform:
                raise DealPlatformNotFoundError()

        # Validate deal status
        deal_status = await self.deal_status_repo.get_by_id(
            data.deal_status_id
        )

        if not deal_status:
            raise DealStatusNotFoundError()

        # Validate lead
        if data.lead_id is not None:

            lead = await self.lead_repo.get_by_id(
                data.lead_id
            )

            if not lead:
                raise LeadNotFoundError()

        deal = Deal(
            title=data.title,
            client_name=data.client_name,
            project_type_id=data.project_type_id,
            platform_id=data.platform_id,
            deal_status_id=data.deal_status_id,
            platform_external_id=data.platform_external_id,
            job_description=data.job_description,
            url=data.url,
            client_email=data.client_email,
            client_phone=data.client_phone,
            contact_email=data.contact_email,
            contact_phone=data.contact_phone,
            contact_description=data.contact_description,
            budget=data.budget,
            meeting_time=data.meeting_time,
            company_id=data.company_id,
            lead_id=data.lead_id,
            external_lead_id=data.external_lead_id,
            accepted_by=data.accepted_by,
            assigned_to=data.assigned_to,
            status_meeting_by_user_id=data.status_meeting_by_user_id,
            status=data.status,
            type=data.type,
            created_by=current_user_id,
        )

        async with self.uow:

            await self.repo.create(deal)
            await self.repo.flush()

        await self.repo.refresh(deal)

        return deal

    async def get_deals(
        self,
        company_id: int | None = None,
    ):

        return await self.repo.get_all(
            company_id=company_id
        )

    async def get_deal(
        self,
        deal_id: int,
    ) -> Deal:

        deal = await self.repo.get_by_id(
            deal_id
        )

        if not deal:
            raise DealNotFoundError()

        return deal

    async def update_deal(
        self,
        deal_id: int,
        data: DealUpdate,
        current_user_id: int,
    ) -> Deal:

        deal = await self.repo.get_by_id(
            deal_id
        )

        if not deal:
            raise DealNotFoundError()

        update_data = data.model_dump(
            exclude_unset=True
        )

        # Validate project type
        if "project_type_id" in update_data:

            if update_data["project_type_id"] is not None:

                project_type = await self.project_type_repo.get_by_id(
                    update_data["project_type_id"]
                )

                if not project_type:
                    raise ProjectTypeNotFoundError()

        # Validate platform
        if "platform_id" in update_data:

            if update_data["platform_id"] is not None:

                platform = await self.platform_repo.get_by_id(
                    update_data["platform_id"]
                )

                if not platform:
                    raise DealPlatformNotFoundError()

        # Validate deal status
        if "deal_status_id" in update_data:

            deal_status = await self.deal_status_repo.get_by_id(
                update_data["deal_status_id"]
            )

            if not deal_status:
                raise DealStatusNotFoundError()

        # Validate company
        if "company_id" in update_data:

            company = await self.company_repo.get_by_id(
                update_data["company_id"]
            )

            if not company:
                raise CompanyNotFoundError()

            if not company.is_active:
                raise CompanyNotFoundError()

        # Validate lead
        if "lead_id" in update_data:

            if update_data["lead_id"] is not None:

                lead = await self.lead_repo.get_by_id(
                    update_data["lead_id"]
                )

                if not lead:
                    raise LeadNotFoundError()

        # Update fields
        for field, value in update_data.items():
            setattr(deal, field, value)

        deal.updated_by = current_user_id

        async with self.uow:

            await self.repo.flush()

        await self.repo.refresh(deal)

        return deal

    async def delete_deal(
        self,
        deal_id: int,
    ) -> None:

        deal = await self.repo.get_by_id(
            deal_id
        )

        if not deal:
            raise DealNotFoundError()

        async with self.uow:

            await self.repo.delete(deal)
            await self.repo.flush()