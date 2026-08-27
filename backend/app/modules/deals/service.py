from app.common.exceptions import (
    DealNotFoundError,
    CompanyNotFoundError,
    LeadNotFoundError,
    ProjectTypeNotFoundError,
    DealPlatformNotFoundError,
    DealStatusNotFoundError,
    UserNotFoundError,
)

from app.modules.deals.model import Deal
from app.modules.feeds.model import ActivityFeed
from app.modules.feeds.repository import ActivityFeedRepository
from app.modules.deals.repository import DealRepository
from app.modules.deals.schema import DealCreate, DealUpdate

from app.modules.companies.repository import CompanyRepository
from app.modules.leads.repository import LeadRepository
from app.modules.project_types.repository import ProjectTypeRepository
from app.modules.deal_platforms.repository import DealPlatformRepository
from app.modules.deal_statuses.repository import DealStatusRepository
from app.modules.users.repository import UserRepository

from app.db.unit_of_work import UnitOfWork
import math

class DealService:

    def __init__(
        self,
        repo: DealRepository,
        feed_repo: ActivityFeedRepository,
        uow: UnitOfWork,
        company_repo: CompanyRepository,
        lead_repo: LeadRepository,
        project_type_repo: ProjectTypeRepository,
        platform_repo: DealPlatformRepository,
        deal_status_repo: DealStatusRepository,
        user_repo: UserRepository
    ):
        self.repo = repo
        self.feed_repo = feed_repo
        self.uow = uow
        self.company_repo = company_repo
        self.lead_repo = lead_repo
        self.project_type_repo = project_type_repo
        self.platform_repo = platform_repo
        self.deal_status_repo = deal_status_repo
        self.user_repo = user_repo

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

        lead = None

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
            if lead is not None:
                lead.is_converted = True
            await self._add_feed_entry(
                deal_id=deal.id,
                user_id=current_user_id,
                event_type="created",
                content="created this deal",
            )

        await self.repo.refresh(deal)

        return deal

    async def _add_feed_entry(
        self,
        deal_id: int,
        user_id: int | None,
        event_type: str,
        content: str,
        metadata_json: dict | None = None,
    ) -> None:
        await self.feed_repo.create(ActivityFeed(
            subject_type="deal",
            subject_id=deal_id,
            user_id=user_id,
            event_type=event_type,
            content=content,
            metadata_json=metadata_json,
        ))

    async def get_deals(
        self,
        company_id: int | None = None,
        deal_status_id: int | None = None,
        platform_id: int | None = None,
        project_type_id: int | None = None,
        assigned_to: int | None = None,
        search: str | None = None,
        page: int = 1,
        page_size: int = 10,
    ):

        deals, total = await self.repo.get_all(
            company_id=company_id,
            deal_status_id=deal_status_id,
            platform_id=platform_id,
            project_type_id=project_type_id,
            assigned_to=assigned_to,
            search=search,
            page=page,
            page_size=page_size
        )

        total_pages = math.ceil(total / page_size) if total else 0

        return {
            "items": deals,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": total_pages,
        }

    async def get_deal_statuses(self):
        return await self.deal_status_repo.get_all()

    async def get_project_types(self):
        return await self.project_type_repo.get_all()

    async def get_platforms(self):
        return await self.platform_repo.get_all()

    async def get_feed(self, deal_id: int) -> list[dict]:
        deal = await self.repo.get_by_id(deal_id)
        if not deal:
            raise DealNotFoundError()

        entries = await self.feed_repo.get_for_subject("deal", deal_id)
        return [
            {
                "id": entry.id,
                "deal_id": entry.subject_id,
                "user_id": entry.user_id,
                "actor_name": (
                    f"{entry.actor.first_name} {entry.actor.last_name}"
                    if entry.actor else None
                ),
                "event_type": entry.event_type,
                "content": entry.content,
                "metadata_json": entry.metadata_json,
                "created_at": entry.created_at,
                "updated_at": entry.updated_at,
            }
            for entry in entries
        ]

    async def add_comment(
        self,
        deal_id: int,
        content: str,
        current_user_id: int,
    ) -> None:
        deal = await self.repo.get_by_id(deal_id)
        if not deal:
            raise DealNotFoundError()

        async with self.uow:
            await self._add_feed_entry(
                deal_id=deal_id,
                user_id=current_user_id,
                event_type="comment",
                content=content.strip(),
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
        # Assignment and status changes are intentionally handled by their
        # dedicated endpoints so their activity is recorded accurately.
        update_data.pop("assigned_to", None)
        update_data.pop("deal_status_id", None)
        update_data.pop("accepted_by", None)

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
            if update_data:
                await self._add_feed_entry(
                    deal_id=deal.id,
                    user_id=current_user_id,
                    event_type="updated",
                    content="updated the deal",
                    metadata_json={"fields": sorted(update_data.keys())},
                )

        await self.repo.refresh(deal)

        return deal

    async def assign_deal(
        self,
        deal_id: int,
        assigned_to: int,
        current_user_id: int
    ) -> Deal:

        deal = await self.repo.get_by_id(deal_id)

        if not deal:
            raise DealNotFoundError()

        user = await self.user_repo.get_by_id(assigned_to)

        if not user:
            raise UserNotFoundError()

        if not user.is_active:
            raise UserNotFoundError()

        previous_assignee = deal.assigned_to
        deal.assigned_to = assigned_to
        deal.updated_by = current_user_id

        is_acceptance = previous_assignee is None and assigned_to == current_user_id
        if is_acceptance:
            deal.accepted_by = current_user_id

        async with self.uow:
            await self.repo.flush()
            await self._add_feed_entry(
                deal_id=deal.id,
                user_id=current_user_id,
                event_type="accepted" if is_acceptance else "assigned",
                content=(
                    "accepted this deal"
                    if is_acceptance
                    else f"assigned this deal to {user.first_name} {user.last_name}"
                ),
                metadata_json={"assigned_to": assigned_to},
            )

        await self.repo.refresh(deal)

        return deal

    async def update_deal_status(
        self,
        deal_id: int,
        deal_status_id: int,
        current_user_id: int
    ) -> Deal:

        deal = await self.repo.get_by_id(deal_id)

        if not deal:
            raise DealNotFoundError()

        old_status = await self.deal_status_repo.get_by_id(
            deal.deal_status_id
        )
        old_status_id = deal.deal_status_id

        deal_status = await self.deal_status_repo.get_by_id(
            deal_status_id
        )

        if not deal_status:
            raise DealStatusNotFoundError()

        deal.deal_status_id = deal_status_id
        deal.updated_by = current_user_id

        async with self.uow:
            await self.repo.flush()
            await self._add_feed_entry(
                deal_id=deal.id,
                user_id=current_user_id,
                event_type="status_changed",
                content=(
                    f"changed status from {old_status.name if old_status else 'Unknown'} "
                    f"to {deal_status.name}"
                ),
                metadata_json={
                    "old_status_id": old_status_id,
                    "new_status_id": deal_status_id,
                },
            )

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
