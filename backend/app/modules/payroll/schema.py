from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class PayrollProcessRequest(BaseModel):
    user_id: int = Field(gt=0)

    payroll_month: int = Field(
        ge=1,
        le=12,
    )

    payroll_year: int = Field(
        ge=2000,
        le=2100,
    )


class PayrollItemResponse(BaseModel):
    id: int
    payroll_id: int
    salary_component_id: int
    component_name: str
    component_code: str
    component_type: int
    calculation_type: int
    calculation_value: Decimal
    calculated_amount: Decimal

    model_config = ConfigDict(
        from_attributes=True,
    )


class PayrollResponse(BaseModel):
    id: int
    company_id: int
    user_id: int
    payroll_month: int
    payroll_year: int
    basic_salary: Decimal
    gross_salary: Decimal
    total_deductions: Decimal
    net_salary: Decimal
    status: int
    paid_at: date | None
    remarks: str | None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )


class PayrollDetailResponse(PayrollResponse):
    items: list[PayrollItemResponse] = []


class PayrollListResponse(BaseModel):
    items: list[PayrollResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

class PayrollUpdateRequest(BaseModel):
    remarks: str | None = None