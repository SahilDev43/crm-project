from sqlalchemy import select

from app.db.base_repository import BaseRepository
from app.modules.project_types.model import ProjectType


class ProjectTypeRepository(BaseRepository):

    async def get_by_id(
        self,
        project_type_id: int,
    ) -> ProjectType | None:

        result = await self.db.execute(
            select(ProjectType).where(
                ProjectType.id == project_type_id
            )
        )

        return result.scalar_one_or_none()

    async def get_all(self) -> list[ProjectType]:

        result = await self.db.execute(
            select(ProjectType).order_by(ProjectType.id)
        )

        return list(result.scalars().all())
