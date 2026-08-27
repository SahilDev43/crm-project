from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.db.base_repository import BaseRepository
from app.modules.feeds.model import ActivityFeed


class ActivityFeedRepository(BaseRepository):
    async def create(self, entry: ActivityFeed) -> ActivityFeed:
        self.db.add(entry)
        return entry

    async def get_for_subject(
        self,
        subject_type: str,
        subject_id: int,
    ) -> list[ActivityFeed]:
        result = await self.db.execute(
            select(ActivityFeed)
            .options(selectinload(ActivityFeed.actor))
            .where(
                ActivityFeed.subject_type == subject_type,
                ActivityFeed.subject_id == subject_id,
            )
            .order_by(ActivityFeed.created_at.desc(), ActivityFeed.id.desc())
        )
        return list(result.scalars().all())
