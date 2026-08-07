from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.leads.model import LeadStatus
from app.seeders.base import BaseSeeder


class LeadStatusSeeder(BaseSeeder):

    DEFAULT_STATUSES = [
        {
            "name": "New",
            "code": "new",
        },
        {
            "name": "Reviewed",
            "code": "reviewed",
        },
        {
            "name": "Spam",
            "code": "spam",
        },
        {
            "name": "Rejected",
            "code": "rejected",
        },
        {
            "name": "Converted",
            "code": "converted",
        },
    ]

    async def run(
        self,
        db: AsyncSession,
    ) -> None:

        for status_data in self.DEFAULT_STATUSES:

            result = await db.execute(
                select(LeadStatus).where(
                    LeadStatus.code == status_data["code"]
                )
            )

            existing = result.scalar_one_or_none()

            if existing:
                continue

            db.add(
                LeadStatus(**status_data)
            )

        await db.commit()