from datetime import date
import math

from sqlalchemy import select

from app.common.exceptions import (
    EmployeeNotFoundError,
    EmployeeInactiveError,
    SalaryStructureNotFoundError,
    SalaryStructureInactiveError,
    InvalidEffectiveDateRangeError,
    SalaryPeriodOverlapError,
    EmployeeSalaryNotFoundError,
)

from app.modules.employee_salaries.model import EmployeeSalary
from app.modules.employee_salaries.repository import (
    EmployeeSalaryRepository,
)
from app.modules.employee_salaries.schema import (
    EmployeeSalaryCreate,
    EmployeeSalaryUpdate,
)
from app.modules.users.model import User
from app.modules.salary_structures.model import SalaryStructure


class EmployeeSalaryService:

    def __init__(
        self,
        repository: EmployeeSalaryRepository,
    ):
        self.repository = repository

    async def _validate_employee(
        self,
        user_id: int,
        company_id: int,
    ) -> User:

        result = await self.repository.db.execute(
            select(User).where(
                User.id == user_id,
                User.company_id == company_id,
                User.is_deleted.is_(False),
            )
        )

        user = result.scalar_one_or_none()

        if not user:
            raise EmployeeNotFoundError()

        if not user.is_active:
            raise EmployeeInactiveError()

        return user

    async def _validate_structure(
        self,
        salary_structure_id: int,
        company_id: int,
    ) -> SalaryStructure:

        result = await self.repository.db.execute(
            select(SalaryStructure).where(
                SalaryStructure.id
                == salary_structure_id,
                SalaryStructure.company_id
                == company_id,
                SalaryStructure.is_deleted.is_(False),
            )
        )

        structure = result.scalar_one_or_none()

        if not structure:
            raise SalaryStructureNotFoundError()

        if not structure.is_active:
            raise SalaryStructureInactiveError()

        return structure

    def _validate_dates(
        self,
        effective_from: date,
        effective_to: date | None,
    ) -> None:

        if (
            effective_to is not None
            and effective_to < effective_from
        ):
            raise InvalidEffectiveDateRangeError()

    async def create(
        self,
        data: EmployeeSalaryCreate,
        company_id: int,
    ) -> EmployeeSalary:

        await self._validate_employee(
            user_id=data.user_id,
            company_id=company_id,
        )

        await self._validate_structure(
            salary_structure_id=data.salary_structure_id,
            company_id=company_id,
        )

        self._validate_dates(
            effective_from=data.effective_from,
            effective_to=data.effective_to,
        )

        overlapping = (
            await self.repository.get_overlapping(
                user_id=data.user_id,
                effective_from=data.effective_from,
                effective_to=data.effective_to,
            )
        )

        if overlapping:
            raise SalaryPeriodOverlapError()

        salary = EmployeeSalary(
            user_id=data.user_id,
            salary_structure_id=data.salary_structure_id,
            effective_from=data.effective_from,
            effective_to=data.effective_to,
            basic_salary=data.basic_salary,
            gross_salary=data.gross_salary,
            status=data.status,
            remarks=data.remarks,
        )

        await self.repository.create(salary)

        await self.repository.db.commit()
        await self.repository.db.refresh(salary)

        return salary

    async def get_by_id(
        self,
        salary_id: int,
        company_id: int,
    ) -> EmployeeSalary:

        salary = await self.repository.get_by_id(
            salary_id=salary_id,
            company_id=company_id,
        )

        if not salary:
            raise EmployeeSalaryNotFoundError()

        return salary

    async def get_all(
        self,
        company_id: int,
        user_id: int | None = None,
        status: int | None = None,
        page: int = 1,
        page_size: int = 20,
    ):

        items, total = await self.repository.get_all(
            company_id=company_id,
            user_id=user_id,
            status=status,
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

    async def get_by_user(
        self,
        user_id: int,
        company_id: int,
        page: int = 1,
        page_size: int = 20,
    ):

        await self._validate_employee(
            user_id=user_id,
            company_id=company_id,
        )

        items, total = (
            await self.repository.get_by_user(
                user_id=user_id,
                company_id=company_id,
                page=page,
                page_size=page_size,
            )
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
        salary_id: int,
        data: EmployeeSalaryUpdate,
        company_id: int,
    ) -> EmployeeSalary:

        salary = await self.get_by_id(
            salary_id=salary_id,
            company_id=company_id,
        )

        new_structure_id = (
            data.salary_structure_id
            if data.salary_structure_id is not None
            else salary.salary_structure_id
        )

        new_from = (
            data.effective_from
            if data.effective_from is not None
            else salary.effective_from
        )

        new_to = (
            data.effective_to
            if data.effective_to is not None
            else salary.effective_to
        )

        await self._validate_structure(
            salary_structure_id=new_structure_id,
            company_id=company_id,
        )

        self._validate_dates(
            effective_from=new_from,
            effective_to=new_to,
        )

        overlapping = (
            await self.repository.get_overlapping(
                user_id=salary.user_id,
                effective_from=new_from,
                effective_to=new_to,
                exclude_id=salary.id,
            )
        )

        if overlapping:
            raise SalaryPeriodOverlapError()

        if data.salary_structure_id is not None:
            salary.salary_structure_id = (
                data.salary_structure_id
            )

        if data.effective_from is not None:
            salary.effective_from = (
                data.effective_from
            )

        if data.effective_to is not None:
            salary.effective_to = (
                data.effective_to
            )

        if data.basic_salary is not None:
            salary.basic_salary = (
                data.basic_salary
            )

        if data.gross_salary is not None:
            salary.gross_salary = (
                data.gross_salary
            )

        if data.status is not None:
            salary.status = data.status

        if data.remarks is not None:
            salary.remarks = data.remarks

        await self.repository.update(salary)

        await self.repository.db.commit()
        await self.repository.db.refresh(salary)

        return salary

    async def delete(
        self,
        salary_id: int,
        company_id: int,
    ) -> None:

        salary = await self.get_by_id(
            salary_id=salary_id,
            company_id=company_id,
        )

        await self.repository.delete(salary)

        await self.repository.db.commit()