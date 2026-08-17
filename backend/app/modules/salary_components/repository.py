from sqlalchemy import func, select

from app.db.base_repository import BaseRepository
from app.modules.salary_components.model import SalaryComponent


class SalaryComponentRepository(BaseRepository):

    async def get_by_id(
        self,
        component_id: int,
    ) -> SalaryComponent | None:

        result = await self.db.execute(
            select(SalaryComponent).where(
                SalaryComponent.id == component_id,
                SalaryComponent.is_deleted.is_(False),
            )
        )

        return result.scalar_one_or_none()

    async def get_by_code(
        self,
        code: str,
    ) -> SalaryComponent | None:

        result = await self.db.execute(
            select(SalaryComponent).where(
                SalaryComponent.code == code,
                SalaryComponent.is_deleted.is_(False),
            )
        )

        return result.scalar_one_or_none()

    async def get_all(
        self,
        search: str | None = None,
        component_type: int | None = None,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[list[SalaryComponent], int]:

        query = select(SalaryComponent).where(
            SalaryComponent.is_deleted.is_(False)
        )

        if search:
            search_value = f"%{search.strip()}%"

            query = query.where(
                SalaryComponent.name.ilike(search_value)
                | SalaryComponent.code.ilike(search_value)
            )

        if component_type is not None:
            query = query.where(
                SalaryComponent.component_type
                == component_type
            )

        count_query = select(
            func.count()
        ).select_from(query.subquery())

        count_result = await self.db.execute(
            count_query
        )

        total = count_result.scalar_one()

        offset = (page - 1) * page_size

        query = (
            query
            .order_by(SalaryComponent.id.desc())
            .offset(offset)
            .limit(page_size)
        )

        result = await self.db.execute(query)

        items = list(result.scalars().all())

        return items, total

    async def create(
        self,
        component: SalaryComponent,
    ) -> SalaryComponent:

        self.db.add(component)

        return component

    async def update(
        self,
        component: SalaryComponent,
    ) -> SalaryComponent:

        return component

    async def delete(
        self,
        component: SalaryComponent,
    ) -> None:

        component.is_deleted = True