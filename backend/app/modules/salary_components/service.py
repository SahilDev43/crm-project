import math

from app.common.exceptions import (
    SalaryComponentCodeExistsError,
    SalaryComponentNotFoundError,
)

from app.modules.salary_components.model import SalaryComponent
from app.modules.salary_components.repository import (
    SalaryComponentRepository,
)
from app.modules.salary_components.schema import (
    SalaryComponentCreate,
    SalaryComponentUpdate,
)


class SalaryComponentService:

    def __init__(
        self,
        repository: SalaryComponentRepository,
    ):
        self.repository = repository

    async def create(
        self,
        data: SalaryComponentCreate,
    ) -> SalaryComponent:

        existing = await self.repository.get_by_code(
            data.code.strip().upper()
        )

        if existing:
            raise SalaryComponentCodeExistsError()

        component = SalaryComponent(
            name=data.name.strip(),
            code=data.code.strip().upper(),
            component_type=data.component_type,
            description=data.description,
            is_active=data.is_active,
        )

        await self.repository.create(component)

        await self.repository.db.commit()
        await self.repository.db.refresh(component)

        return component

    async def get_by_id(
        self,
        component_id: int,
    ) -> SalaryComponent:

        component = await self.repository.get_by_id(
            component_id
        )

        if not component:
            raise SalaryComponentNotFoundError()

        return component

    async def get_all(
        self,
        search: str | None = None,
        component_type: int | None = None,
        page: int = 1,
        page_size: int = 20,
    ):

        items, total = await self.repository.get_all(
            search=search,
            component_type=component_type,
            page=page,
            page_size=page_size,
        )

        total_pages = (
            math.ceil(total / page_size)
            if total
            else 0
        )

        return {
            "items": items,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": total_pages,
        }

    async def update(
        self,
        component_id: int,
        data: SalaryComponentUpdate,
    ) -> SalaryComponent:

        component = await self.get_by_id(
            component_id
        )

        if data.code is not None:

            new_code = data.code.strip().upper()

            existing = await self.repository.get_by_code(
                new_code
            )

            if (
                existing
                and existing.id != component.id
            ):
                raise SalaryComponentCodeExistsError()

            component.code = new_code

        if data.name is not None:
            component.name = data.name.strip()

        if data.component_type is not None:
            component.component_type = (
                data.component_type
            )

        if data.description is not None:
            component.description = data.description

        if data.is_active is not None:
            component.is_active = data.is_active

        await self.repository.update(component)

        await self.repository.db.commit()
        await self.repository.db.refresh(component)

        return component

    async def delete(
        self,
        component_id: int,
    ) -> None:

        component = await self.get_by_id(
            component_id
        )

        await self.repository.delete(component)

        await self.repository.db.commit()