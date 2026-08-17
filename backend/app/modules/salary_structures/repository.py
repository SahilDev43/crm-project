from sqlalchemy import func, select

from app.db.base_repository import BaseRepository
from app.modules.salary_structures.model import SalaryStructure
from app.modules.salary_structures.component_model import (
    SalaryStructureComponent,
)


class SalaryStructureRepository(BaseRepository):

    async def get_by_id(
        self,
        structure_id: int,
        company_id: int | None = None,
    ) -> SalaryStructure | None:

        query = select(SalaryStructure).where(
            SalaryStructure.id == structure_id,
            SalaryStructure.is_deleted.is_(False),
        )

        if company_id is not None:
            query = query.where(
                SalaryStructure.company_id == company_id
            )

        result = await self.db.execute(query)

        return result.scalar_one_or_none()

    async def get_by_code(
        self,
        code: str,
        company_id: int,
    ) -> SalaryStructure | None:

        result = await self.db.execute(
            select(SalaryStructure).where(
                SalaryStructure.code == code,
                SalaryStructure.company_id == company_id,
                SalaryStructure.is_deleted.is_(False),
            )
        )

        return result.scalar_one_or_none()

    async def get_all(
        self,
        company_id: int,
        search: str | None = None,
        is_active: bool | None = None,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[list[SalaryStructure], int]:

        query = select(SalaryStructure).where(
            SalaryStructure.company_id == company_id,
            SalaryStructure.is_deleted.is_(False),
        )

        if search:
            search_value = f"%{search.strip()}%"

            query = query.where(
                SalaryStructure.name.ilike(search_value)
                | SalaryStructure.code.ilike(search_value)
            )

        if is_active is not None:
            query = query.where(
                SalaryStructure.is_active == is_active
            )

        count_query = select(
            func.count()
        ).select_from(
            query.subquery()
        )

        count_result = await self.db.execute(
            count_query
        )

        total = count_result.scalar_one()

        offset = (page - 1) * page_size

        query = (
            query
            .order_by(
                SalaryStructure.id.desc()
            )
            .offset(offset)
            .limit(page_size)
        )

        result = await self.db.execute(query)

        items = list(
            result.scalars().all()
        )

        return items, total

    async def create(
        self,
        structure: SalaryStructure,
    ) -> SalaryStructure:

        self.db.add(structure)

        return structure

    async def update(
        self,
        structure: SalaryStructure,
    ) -> SalaryStructure:

        return structure

    async def delete(
        self,
        structure: SalaryStructure,
    ) -> None:

        structure.is_deleted = True

    async def get_components(
        self,
        structure_id: int,
    ) -> list[SalaryStructureComponent]:

        result = await self.db.execute(
            select(SalaryStructureComponent)
            .where(
                SalaryStructureComponent.salary_structure_id
                == structure_id,
                SalaryStructureComponent.is_deleted.is_(False),
            )
            .order_by(
                SalaryStructureComponent.id
            )
        )

        return list(
            result.scalars().all()
        )

    async def get_component(
        self,
        structure_id: int,
        component_id: int,
    ) -> SalaryStructureComponent | None:

        result = await self.db.execute(
            select(SalaryStructureComponent)
            .where(
                SalaryStructureComponent.id
                == component_id,
                SalaryStructureComponent.salary_structure_id
                == structure_id,
                SalaryStructureComponent.is_deleted.is_(False),
            )
        )

        return result.scalar_one_or_none()

    async def get_structure_component_by_salary_component(
        self,
        structure_id: int,
        salary_component_id: int,
    ) -> SalaryStructureComponent | None:

        result = await self.db.execute(
            select(SalaryStructureComponent)
            .where(
                SalaryStructureComponent.salary_structure_id
                == structure_id,
                SalaryStructureComponent.salary_component_id
                == salary_component_id,
                SalaryStructureComponent.is_deleted.is_(False),
            )
        )

        return result.scalar_one_or_none()

    async def add_component(
        self,
        component: SalaryStructureComponent,
    ) -> SalaryStructureComponent:

        self.db.add(component)

        return component

    async def remove_component(
        self,
        component: SalaryStructureComponent,
    ) -> None:

        component.is_deleted = True