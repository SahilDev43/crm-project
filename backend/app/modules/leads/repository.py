from sqlalchemy import func, or_, select
from sqlalchemy.orm import selectinload

from app.db.base_repository import BaseRepository
from app.modules.leads.model import Lead, LeadStatus

class LeadRepository(BaseRepository):

    async def get_by_id(
        self,
        lead_id: int,
    ) -> Lead | None:

        result = await self.db.execute(
            select(Lead)
            .options(
                selectinload(Lead.status),
                selectinload(Lead.company),
            )
            .where(
                Lead.id == lead_id,
                Lead.is_deleted.is_(False),
            )
        )

        return result.scalar_one_or_none()

    async def get_all(
        self,
        company_id: int | None = None,
        status_id: int | None = None,
        lead_type: str | None = None,
        search: str | None = None,
        page: int = 1,
        page_size: int = 10,
    ) -> tuple[list[Lead], int]:
        filters = [Lead.is_deleted.is_(False)]

        if company_id is not None:
            filters.append(Lead.company_id == company_id)

        if status_id is not None:
            filters.append(Lead.status_id == status_id)

        if lead_type:
            filters.append(Lead.lead_type.ilike(f"%{lead_type}%"))

        if search:
            search_term = f"%{search}%"
            filters.append(or_(
                Lead.first_name.ilike(search_term),
                Lead.client_company_name.ilike(search_term),
                Lead.email.ilike(search_term),
                Lead.phone.ilike(search_term),
                Lead.external_lead_id.ilike(search_term),
            ))

        total_result = await self.db.execute(
            select(func.count()).select_from(Lead).where(*filters)
        )
        total = total_result.scalar_one()

        result = await self.db.execute(
            select(Lead)
            .options(
                selectinload(Lead.status),
                selectinload(Lead.company),
            )
            .where(*filters)
            .order_by(Lead.id.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )

        return list(result.scalars().all()), total

    async def get_by_external_id(
        self,
        company_id: int,
        external_lead_id: str,
    ) -> Lead | None:

        result = await self.db.execute(
            select(Lead).where(
                Lead.company_id == company_id,
                Lead.external_lead_id == external_lead_id,
                Lead.is_deleted.is_(False),
            )
        )

        return result.scalar_one_or_none()

    async def get_status_by_code(
        self,
        code: str,
    ) -> LeadStatus | None:

        result = await self.db.execute(
            select(LeadStatus).where(
                LeadStatus.code == code,
                LeadStatus.is_active.is_(True),
            )
        )

        return result.scalar_one_or_none()

    async def get_all_statuses(
        self,
    ) -> list[LeadStatus]:

        result = await self.db.execute(
            select(LeadStatus)
            .where(
                LeadStatus.is_active.is_(True)
            )
            .order_by(LeadStatus.id)
        )

        return list(result.scalars().all())

    async def create(
        self,
        lead: Lead,
    ) -> Lead:

        self.db.add(lead)

        return lead

    async def delete(
        self,
        lead: Lead,
    ) -> Lead:

        lead.is_deleted = True

        return lead
