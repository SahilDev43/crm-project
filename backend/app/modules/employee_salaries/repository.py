from sqlalchemy import func, select

from app.db.base_repository import BaseRepository
from app.modules.employee_salaries.model import EmployeeSalary


class EmployeeSalaryRepository(BaseRepository):

    async def get_by_id(
        self,
        salary_id: int,
        company_id: int,
    ) -> EmployeeSalary | None:

        result = await self.db.execute(
            select(EmployeeSalary).where(
                EmployeeSalary.id == salary_id,
                EmployeeSalary.is_deleted.is_(False),
                EmployeeSalary.salary_structure.has(
                    company_id=company_id
                ),
            )
        )

        return result.scalar_one_or_none()

    async def get_by_user(
        self,
        user_id: int,
        company_id: int,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[list[EmployeeSalary], int]:

        query = (
            select(EmployeeSalary)
            .join(
                EmployeeSalary.salary_structure
            )
            .where(
                EmployeeSalary.user_id == user_id,
                EmployeeSalary.is_deleted.is_(False),
                EmployeeSalary.salary_structure.has(
                    company_id=company_id
                ),
            )
        )

        count_result = await self.db.execute(
            select(func.count())
            .select_from(
                query.subquery()
            )
        )

        total = count_result.scalar_one()

        query = (
            query
            .order_by(
                EmployeeSalary.effective_from.desc()
            )
            .offset(
                (page - 1) * page_size
            )
            .limit(page_size)
        )

        result = await self.db.execute(query)

        return (
            list(result.scalars().all()),
            total,
        )

    async def get_all(
        self,
        company_id: int,
        user_id: int | None = None,
        status: int | None = None,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[list[EmployeeSalary], int]:

        query = (
            select(EmployeeSalary)
            .join(
                EmployeeSalary.salary_structure
            )
            .where(
                EmployeeSalary.is_deleted.is_(False),
                EmployeeSalary.salary_structure.has(
                    company_id=company_id
                ),
            )
        )

        if user_id is not None:
            query = query.where(
                EmployeeSalary.user_id == user_id
            )

        if status is not None:
            query = query.where(
                EmployeeSalary.status == status
            )

        count_result = await self.db.execute(
            select(func.count())
            .select_from(
                query.subquery()
            )
        )

        total = count_result.scalar_one()

        query = (
            query
            .order_by(
                EmployeeSalary.effective_from.desc()
            )
            .offset(
                (page - 1) * page_size
            )
            .limit(page_size)
        )

        result = await self.db.execute(query)

        return (
            list(result.scalars().all()),
            total,
        )

    async def get_overlapping(
        self,
        user_id: int,
        effective_from,
        effective_to,
        exclude_id: int | None = None,
    ) -> EmployeeSalary | None:

        query = select(EmployeeSalary).where(
            EmployeeSalary.user_id == user_id,
            EmployeeSalary.is_deleted.is_(False),
        )

        if exclude_id is not None:
            query = query.where(
                EmployeeSalary.id != exclude_id
            )

        # Existing period overlaps the new period.
        if effective_to is not None:
            query = query.where(
                EmployeeSalary.effective_from
                <= effective_to
            )

        query = query.where(
            EmployeeSalary.effective_to.is_(None)
            | (
                EmployeeSalary.effective_to
                >= effective_from
            )
        )

        result = await self.db.execute(query)

        return result.scalar_one_or_none()

    async def create(
        self,
        salary: EmployeeSalary,
    ) -> EmployeeSalary:

        self.db.add(salary)

        return salary

    async def update(
        self,
        salary: EmployeeSalary,
    ) -> EmployeeSalary:

        return salary

    async def delete(
        self,
        salary: EmployeeSalary,
    ) -> None:

        salary.is_deleted = True