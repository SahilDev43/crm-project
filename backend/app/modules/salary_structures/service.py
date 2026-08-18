from decimal import Decimal
import math

from sqlalchemy import select

from app.common.constants.payroll import (
    CalculationType,
    CalculationBase,
)

from app.common.exceptions import (
    SalaryStructureNotFoundError,
    SalaryStructureCodeExistsError,
    SalaryStructureComponentExistsError,
    SalaryComponentNotFoundError,
    InvalidCalculationTypeError,
    FixedComponentCalculationBaseError,
    PercentageComponentCalculationBaseRequiredError,
    ComponentBaseRequiredError,
    ComponentBaseNotAllowedError,
    NegativeComponentValueError,
    SalaryStructureComponentNotFoundError,
)

from app.modules.salary_components.model import SalaryComponent
from app.modules.salary_structures.component_model import (
    SalaryStructureComponent,
)
from app.modules.salary_structures.model import SalaryStructure
from app.modules.salary_structures.repository import (
    SalaryStructureRepository,
)
from app.modules.salary_structures.schema import (
    SalaryStructureCreate,
    SalaryStructureUpdate,
    SalaryStructureComponentCreate,
)


class SalaryStructureService:

    def __init__(
        self,
        repository: SalaryStructureRepository,
    ):
        self.repository = repository

    async def create(
        self,
        data: SalaryStructureCreate,
        company_id: int,
    ) -> SalaryStructure:

        code = data.code.strip().upper()

        existing = await self.repository.get_by_code(
            code=code,
            company_id=company_id,
        )

        if existing:
            raise SalaryStructureCodeExistsError()

        structure = SalaryStructure(
            company_id=company_id,
            name=data.name.strip(),
            code=code,
            description=data.description,
            is_active=data.is_active,
        )

        await self.repository.create(structure)

        await self.repository.db.commit()
        await self.repository.db.refresh(structure)

        return structure

    async def get_by_id(
        self,
        structure_id: int,
        company_id: int,
    ) -> SalaryStructure:

        structure = await self.repository.get_by_id(
            structure_id=structure_id,
            company_id=company_id,
        )

        if not structure:
            raise SalaryStructureNotFoundError()

        return structure

    async def get_all(
        self,
        company_id: int,
        search: str | None = None,
        is_active: bool | None = None,
        page: int = 1,
        page_size: int = 20,
    ):

        items, total = await self.repository.get_all(
            company_id=company_id,
            search=search,
            is_active=is_active,
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
        structure_id: int,
        data: SalaryStructureUpdate,
        company_id: int,
    ) -> SalaryStructure:

        structure = await self.get_by_id(
            structure_id=structure_id,
            company_id=company_id,
        )

        if data.code is not None:

            new_code = data.code.strip().upper()

            existing = await self.repository.get_by_code(
                code=new_code,
                company_id=company_id,
            )

            if (
                existing
                and existing.id != structure.id
            ):
                raise SalaryStructureCodeExistsError()

            structure.code = new_code

        if data.name is not None:
            structure.name = data.name.strip()

        if data.description is not None:
            structure.description = data.description

        if data.is_active is not None:
            structure.is_active = data.is_active

        await self.repository.update(structure)

        await self.repository.db.commit()
        await self.repository.db.refresh(structure)

        return structure

    async def delete(
        self,
        structure_id: int,
        company_id: int,
    ) -> None:

        structure = await self.get_by_id(
            structure_id=structure_id,
            company_id=company_id,
        )

        await self.repository.delete(structure)

        await self.repository.db.commit()

    async def get_components(
        self,
        structure_id: int,
        company_id: int,
    ):

        await self.get_by_id(
            structure_id=structure_id,
            company_id=company_id,
        )

        return await self.repository.get_components(
            structure_id
        )

    async def add_component(
        self,
        structure_id: int,
        data: SalaryStructureComponentCreate,
        company_id: int,
    ) -> SalaryStructureComponent:

        await self.get_by_id(
            structure_id=structure_id,
            company_id=company_id,
        )

        existing = (
            await self.repository
            .get_structure_component_by_salary_component(
                structure_id=structure_id,
                salary_component_id=data.salary_component_id,
            )
        )

        if existing:
            raise SalaryStructureComponentExistsError()

        component_result = await self.repository.db.execute(
            select(SalaryComponent).where(
                SalaryComponent.id
                == data.salary_component_id,
                SalaryComponent.is_deleted.is_(False),
                SalaryComponent.is_active.is_(True),
            )
        )

        salary_component = (
            component_result.scalar_one_or_none()
        )

        if not salary_component:
            raise SalaryComponentNotFoundError()

        if data.calculation_type not in (
            CalculationType.FIXED,
            CalculationType.PERCENTAGE
        ):
            raise InvalidCalculationTypeError()

        if (
            data.calculation_type == CalculationType.FIXED
            and data.calculation_base is not None
        ):
            raise FixedComponentCalculationBaseError()

        if (
            data.calculation_type == CalculationType.PERCENTAGE
            and data.calculation_base is None
        ):
            raise PercentageComponentCalculationBaseRequiredError()

        if (
            data.calculation_base == CalculationBase.COMPONENT
            and data.calculation_base_component_id
            is None
        ):
            raise ComponentBaseRequiredError()

        if (
            data.calculation_base != CalculationBase.COMPONENT
            and data.calculation_base_component_id
            is not None
        ):
            raise ComponentBaseNotAllowedError()

        if data.value < Decimal("0"):
            raise NegativeComponentValueError()

        structure_component = (
            SalaryStructureComponent(
                salary_structure_id=structure_id,
                salary_component_id=data.salary_component_id,
                calculation_type=data.calculation_type,
                calculation_base=data.calculation_base,
                calculation_base_component_id=(
                    data.calculation_base_component_id
                ),
                value=data.value,
                is_active=data.is_active,
            )
        )

        await self.repository.add_component(
            structure_component
        )

        await self.repository.db.commit()
        await self.repository.db.refresh(
            structure_component
        )

        return structure_component

    async def remove_component(
        self,
        structure_id: int,
        component_id: int,
        company_id: int,
    ) -> None:

        await self.get_by_id(
            structure_id=structure_id,
            company_id=company_id,
        )

        component = await self.repository.get_component(
            structure_id=structure_id,
            component_id=component_id,
        )

        if not component:
            raise SalaryStructureComponentNotFoundError()

        await self.repository.remove_component(
            component
        )

        await self.repository.db.commit()