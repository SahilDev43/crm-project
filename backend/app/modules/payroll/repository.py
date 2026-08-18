import math

from sqlalchemy import func, select
from sqlalchemy.orm import selectinload
from app.modules.payroll.model import Payroll
from app.modules.payroll.item_model import PayrollItem
from app.modules.employee_salaries.model import EmployeeSalary
from app.modules.salary_structures.component_model import (
    SalaryStructureComponent,
)
from app.modules.salary_structures.model import SalaryStructure

class PayrollRepository:

    def __init__(self, db):
        self.db = db


    async def get_by_id(
        self,
        payroll_id: int,
        company_id: int
    ):

        result = await self.db.execute(
            select(Payroll).where(
                Payroll.id == payroll_id,
                Payroll.company_id == company_id,
                Payroll.is_deleted.is_(False)
            )
        )

        return result.scalar_one_or_none()

    async def get_by_user_period(
        self,
        user_id: int,
        payroll_month: int,
        payroll_year: int,
        company_id: int
    ):

        result = await self.db.execute(
            select(Payroll)
            .where(
                Payroll.user_id == user_id,
                Payroll.payroll_month == payroll_month,
                Payroll.payroll_year == payroll_year,
                Payroll.company_id == company_id,
                Payroll.is_deleted.is_(False)
            )
        )

        return result.scalar_one_or_none()

    async def get_all(
        self,
        company_id: int,
        user_id: int | None = None,
        payroll_month: int | None = None,
        payroll_year: int | None = None,
        status: int | None = None,
        page: int = 1,
        page_size: int = 20 
    ):

        conditions = [
            Payroll.company_id == company_id,
            Payroll.is_deleted.is_(False)
        ]

        if user_id is not None:
            conditions.append(
                Payroll.user_id == user_id
            )

        if payroll_month is not None:
            conditions.append(
                Payroll.payroll_month == payroll_month
            )

        if payroll_year is not None:
            conditions.append(
                Payroll.payroll_year == payroll_year
            )

        if status is not None:
            conditions.append(
                Payroll.status == status
            )

        count_result = await self.db.execute(
            select(func.count(Payroll.id))
            .where(*conditions)
        )

        total = count_result.scalar_one()

        offset = (page - 1) * page_size

        result = await self.db.execute(
            select(Payroll)
            .where(*conditions)
            .order_by(
                Payroll.payroll_year.desc(),
                Payroll.payroll_month.desc(),
                Payroll.id.desc()
            )
            .offset(offset)
            .limit(page_size)
        )

        items = result.scalars().all()

        return items, total


    async def get_items(
        self,
        payroll_id: int
    ):

        result = await self.db.execute(
            select(PayrollItem).where(
                PayrollItem.payroll_id == payroll_id
            )
            .order_by(PayrollItem.id)
        )

        return result.scalars().all()

    async def create(
        self,
        payroll: Payroll
    ):

        self.db.add(payroll)
        await self.db.flush()

        return payroll

    async def create_item(
        self,
        item: PayrollItem
    ):

        self.db.add(item)
        await self.db.flush()

        return item

    async def delete(
        self,
        payroll: Payroll
    ):

        payroll.is_deleted = True

        await self.db.flush()

    async def get_employee_salary_for_period(
        self,
        user_id: int,
        payroll_date,
        company_id: int,
    ):
        result = await self.db.execute(
            select(EmployeeSalary)
            .join(
                EmployeeSalary.salary_structure
            )
            .options(
                selectinload(
                    EmployeeSalary.salary_structure
                )
                .selectinload(
                    SalaryStructure.components
                )
                .selectinload(
                    SalaryStructureComponent.salary_component
                )
            )
            .where(
                EmployeeSalary.user_id == user_id,
                EmployeeSalary.effective_from <= payroll_date,
                EmployeeSalary.is_deleted.is_(False),
                EmployeeSalary.status == 1,
                SalaryStructure.company_id == company_id,
                SalaryStructure.is_deleted.is_(False),
                SalaryStructure.is_active.is_(True),
                (
                    EmployeeSalary.effective_to.is_(None)
                    |
                    (
                        EmployeeSalary.effective_to
                        >= payroll_date
                    )
                ),
            )
            .order_by(
                EmployeeSalary.effective_from.desc()
            )
        )

        return result.scalars().first()