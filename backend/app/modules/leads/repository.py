from sqlalchemy import select
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
    ) -> list[Lead]:

        result = await self.db.execute(
            select(Lead)
            .options(
                selectinload(Lead.status),
                selectinload(Lead.company),
            )
            .where(
                Lead.is_deleted.is_(False)
            )
            .order_by(Lead.id.desc())
        )

        return list(result.scalars().all())

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

    async def get_status_by_id(
        self,
        status_id: int,
    ) -> LeadStatus | None:

        result = await self.db.execute(
            select(LeadStatus).where(
                LeadStatus.id == status_id,
                LeadStatus.is_active.is_(True),
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