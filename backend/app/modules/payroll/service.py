import math 

from decimal import Decimal, ROUND_HALF_UP
from datetime import date

from app.common.constants.payroll import (
    CalculationType,
    CalculationBase,
    ComponentType,
    PayrollStatus,
)

from app.common.exceptions import (
    PayrollAlreadyExistsError,
    ComponentBaseRequiredError,
    BaseComponentNotCalculatedError,
    InvalidCalculationBaseError,
    InvalidCalculationTypeError,
    InvalidComponentTypeError,
    CircularSalaryComponentDependencyError,
    SalaryComponentNotFoundError,
    GrossBasedCalculationNotSupportedError,
    EmployeeSalaryNotFoundError,
    SalaryStructureNoActiveComponentsError,
    PayrollNotFoundError,
    PayrollAlreadyPaidError,
)

from app.modules.payroll.schema import (
    PayrollUpdateRequest
)

from app.modules.payroll.model import Payroll
from app.modules.payroll.item_model import PayrollItem
from app.modules.payroll.repository import PayrollRepository


class PayrollCalculationService:

    @staticmethod
    def calculate_percentage(
        base_amount: Decimal,
        percentage: Decimal,
    ) -> Decimal:

        amount = (
            base_amount * percentage / Decimal("100")
        )

        return amount.quantize(
            Decimal("0.01"),
            rounding=ROUND_HALF_UP,
        )

    @staticmethod
    def calculate_component(
        calculation_type: int,
        calculation_base: int | None,
        value: Decimal,
        basic_salary: Decimal,
        gross_salary: Decimal,
        component_amounts: dict[int, Decimal],
        calculation_base_component_id: int | None = None,
    ) -> Decimal:

        # Fixed amount
        if calculation_type == CalculationType.FIXED:

            return value.quantize(
                Decimal("0.01"),
                rounding=ROUND_HALF_UP,
            )

        # Percentage
        if calculation_type == CalculationType.PERCENTAGE:

            if calculation_base == CalculationBase.BASIC:

                base_amount = basic_salary

            elif calculation_base == CalculationBase.GROSS:

                base_amount = gross_salary

            elif calculation_base == CalculationBase.COMPONENT:

                if calculation_base_component_id is None:
                    raise ComponentBaseRequiredError()

                base_amount = component_amounts.get(
                    calculation_base_component_id
                )

                if base_amount is None:
                    raise BaseComponentNotCalculatedError()

            else:

                raise InvalidCalculationBaseError()

            return PayrollCalculationService.calculate_percentage(
                base_amount=base_amount,
                percentage=value,
            )

        raise InvalidCalculationTypeError()

    @staticmethod
    def calculate_totals(
        components: list[tuple[int, Decimal]],
    ) -> tuple[Decimal, Decimal, Decimal]:
        """
        components:
            [(component_type, calculated_amount), ...]

        Returns:
            (gross_salary, total_deductions, net_salary)
        """

        gross_salary = Decimal("0.00")
        total_deductions = Decimal("0.00")

        for component_type, amount in components:

            amount = amount.quantize(
                Decimal("0.01"),
                rounding=ROUND_HALF_UP,
            )

            if component_type == ComponentType.EARNING:

                gross_salary += amount

            elif component_type == ComponentType.DEDUCTION:

                total_deductions += amount

            else:

                raise InvalidComponentTypeError()

        net_salary = (
            gross_salary - total_deductions
        )

        return (
            gross_salary.quantize(
                Decimal("0.01"),
                rounding=ROUND_HALF_UP,
            ),
            total_deductions.quantize(
                Decimal("0.01"),
                rounding=ROUND_HALF_UP,
            ),
            net_salary.quantize(
                Decimal("0.01"),
                rounding=ROUND_HALF_UP,
            ),
        )


    @staticmethod
    def calculate_structure_components(
            structure_components,
            basic_salary: Decimal,
        ):
            calculated = {}
            calculating = set()

            components_by_id = {
                component.salary_component_id: component
                for component in structure_components
            }

            def calculate_component(component_id: int) -> Decimal:

                if component_id in calculated:
                    return calculated[component_id]

                if component_id in calculating:
                    raise CircularSalaryComponentDependencyError()

                component = components_by_id.get(component_id)

                if component is None:
                    raise SalaryComponentNotFoundError()

                calculating.add(component_id)

                if (
                    component.calculation_type
                    == CalculationType.FIXED
                ):

                    amount = component.value

                else:

                    if (
                        component.calculation_base
                        == CalculationBase.BASIC
                    ):

                        base_amount = basic_salary

                    elif (
                        component.calculation_base
                        == CalculationBase.COMPONENT
                    ):

                        base_component_id = (
                            component.calculation_base_component_id
                        )

                        if base_component_id is None:
                            raise ComponentBaseRequiredError()

                        base_amount = calculate_component(
                            base_component_id
                        )

                    else:
                        raise GrossBasedCalculationNotSupportedError()

                    amount = PayrollCalculationService.calculate_percentage(
                        base_amount=base_amount,
                        percentage=component.value,
                    )

                amount = amount.quantize(
                    Decimal("0.01"),
                    rounding=ROUND_HALF_UP,
                )

                calculating.remove(component_id)

                calculated[component_id] = amount

                return amount

            for component in structure_components:
                calculate_component(
                    component.salary_component_id
                )

            return calculated

    @staticmethod
    def calculate_gross_based_components(
            structure_components,
            basic_salary: Decimal,
            component_amounts: dict[int, Decimal],
        ):
            """
            Calculate components whose base is Gross Salary.

            Gross is calculated only from earnings that have already
            been calculated.

            Returns:
                updated component_amounts
            """

            gross_salary = Decimal("0.00")

            # Calculate current gross from earnings
            for component in structure_components:

                component_id = component.salary_component_id

                if component_id not in component_amounts:
                    continue

                amount = component_amounts[component_id]

                # Gross includes earnings only
                if component.salary_component.component_type == (
                    ComponentType.EARNING
                ):
                    gross_salary += amount

            gross_salary = gross_salary.quantize(
                Decimal("0.01"),
                rounding=ROUND_HALF_UP,
            )

            for component in structure_components:

                if (
                    component.calculation_type
                    != CalculationType.PERCENTAGE
                ):
                    continue

                if (
                    component.calculation_base
                    != CalculationBase.GROSS
                ):
                    continue

                amount = PayrollCalculationService.calculate_percentage(
                    base_amount=gross_salary,
                    percentage=component.value,
                )

                component_amounts[
                    component.salary_component_id
                ] = amount

            return component_amounts


class PayrollService:

    def __init__(
        self,
        repository: PayrollRepository,
    ):
        self.repository = repository

    async def process_payroll(
        self,
        user_id: int,
        payroll_month: int,
        payroll_year: int,
        company_id: int,
    ):
        # Prevent duplicate payroll
        existing = await self.repository.get_by_user_period(
            user_id=user_id,
            payroll_month=payroll_month,
            payroll_year=payroll_year,
            company_id=company_id,
        )

        if existing:
            raise PayrollAlreadyExistsError()

        payroll_date = date(
            payroll_year,
            payroll_month,
            1,
        )

        # Find employee's salary applicable to this period
        employee_salary = (
            await self.repository
            .get_employee_salary_for_period(
                user_id=user_id,
                payroll_date=payroll_date,
                company_id=company_id,
            )
        )

        if not employee_salary:
            raise EmployeeSalaryNotFoundError()

        structure_components = [
            component
            for component
            in employee_salary.salary_structure.components
            if (
                component.is_active
                and component.salary_component.is_active
                and not component.salary_component.is_deleted
            )
        ]

        if not structure_components:
            raise SalaryStructureNoActiveComponentsError()

        basic_salary = Decimal(
            employee_salary.basic_salary
        )

        # --------------------------------
        # 1. Calculate normal components
        # --------------------------------

        component_amounts = (
            PayrollCalculationService
            .calculate_structure_components(
                structure_components=structure_components,
                basic_salary=basic_salary,
            )
        )

        # --------------------------------
        # 2. Calculate Gross-based items
        # --------------------------------

        component_amounts = (
            PayrollCalculationService
            .calculate_gross_based_components(
                structure_components=structure_components,
                basic_salary=basic_salary,
                component_amounts=component_amounts,
            )
        )

        # --------------------------------
        # 3. Calculate totals
        # --------------------------------

        component_totals = []

        for component in structure_components:

            amount = component_amounts.get(
                component.salary_component_id,
                Decimal("0.00"),
            )

            component_totals.append(
                (
                    component.salary_component.component_type,
                    amount,
                )
            )

        (
            gross_salary,
            total_deductions,
            net_salary,
        ) = (
            PayrollCalculationService
            .calculate_totals(
                component_totals
            )
        )

        # --------------------------------
        # 4. Create payroll
        # --------------------------------

        payroll = Payroll(
            company_id=company_id,
            user_id=user_id,
            payroll_month=payroll_month,
            payroll_year=payroll_year,
            basic_salary=basic_salary,
            gross_salary=gross_salary,
            total_deductions=total_deductions,
            net_salary=net_salary,
            status=PayrollStatus.PROCESSED,
        )

        await self.repository.create(payroll)

        # --------------------------------
        # 5. Create payroll item snapshots
        # --------------------------------

        for component in structure_components:

            amount = component_amounts[
                component.salary_component_id
            ]

            item = PayrollItem(
                payroll_id=payroll.id,
                salary_component_id=(
                    component.salary_component_id
                ),
                component_name=(
                    component.salary_component.name
                ),
                component_code=(
                    component.salary_component.code
                ),
                component_type=(
                    component.salary_component.component_type
                ),
                calculation_type=(
                    component.calculation_type
                ),
                calculation_value=component.value,
                calculated_amount=amount,
            )

            await self.repository.create_item(item)

        await self.repository.db.commit()

        await self.repository.db.refresh(
            payroll
        )

        return payroll

    async def get_all(
        self,
        company_id: int,
        user_id: int | None = None,
        payroll_month: int | None = None,
        payroll_year: int | None = None,
        status: int | None = None,
        page: int = 1,
        page_size: int = 20,
    ):
        items, total = await self.repository.get_all(
            company_id=company_id,
            user_id=user_id,
            payroll_month=payroll_month,
            payroll_year=payroll_year,
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

    async def get_by_id(
        self,
        payroll_id: int,
        company_id: int,
    ):
        payroll = await self.repository.get_by_id(
            payroll_id=payroll_id,
            company_id=company_id,
        )

        if not payroll:
            raise PayrollNotFoundError()

        items = await self.repository.get_items(
            payroll_id=payroll.id
        )

        return {
            "id": payroll.id,
            "company_id": payroll.company_id,
            "user_id": payroll.user_id,
            "payroll_month": payroll.payroll_month,
            "payroll_year": payroll.payroll_year,
            "basic_salary": payroll.basic_salary,
            "gross_salary": payroll.gross_salary,
            "total_deductions": payroll.total_deductions,
            "net_salary": payroll.net_salary,
            "status": payroll.status,
            "paid_at": payroll.paid_at,
            "remarks": payroll.remarks,
            "created_at": payroll.created_at,
            "updated_at": payroll.updated_at,
            "items": items,
        }

    async def get_items(
        self,
        payroll_id: int,
        company_id: int,
    ):
        payroll = await self.repository.get_by_id(
            payroll_id=payroll_id,
            company_id=company_id,
        )

        if not payroll:
            raise PayrollNotFoundError()

        return await self.repository.get_items(
            payroll_id=payroll_id,
        )


    async def mark_as_paid(
        self,
        payroll_id: int,
        company_id: int
    ) -> Payroll:

        payroll = await self.repository.get_by_id(
            payroll_id=payroll_id,
            company_id=company_id
        )

        if not payroll:
            raise PayrollNotFoundError()

        if payroll.status == PayrollStatus.PAID:
            raise PayrollAlreadyPaidError()

        payroll.status = PayrollStatus.PAID
        payroll.paid_at = date.today()

        await self.repository.db.commit()
        await self.repository.db.refresh(payroll)

        return payroll

    async def update(
        self,
        payroll_id: int,
        data: PayrollUpdateRequest,
        company_id: int,
    ) -> Payroll:

        payroll = await self.repository.get_by_id(
            payroll_id=payroll_id,
            company_id=company_id,
        )

        if not payroll:
            raise PayrollNotFoundError()

        payroll.remarks = data.remarks

        await self.repository.db.commit()
        await self.repository.db.refresh(payroll)

        return payroll