from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class EmployeeSalaryCreate(BaseModel):
    user_id: int
    salary_structure_id: int

    effective_from: date

    effective_to: date | None = None

    basic_salary: Decimal = Field(
        ge=0,
        max_digits=15,
        decimal_places=2,
    )

    gross_salary: Decimal | None = Field(
        default=None,
        ge=0,
        max_digits=15,
        decimal_places=2,
    )

    status: int = Field(
        default=1,
        ge=1,
        le=2,
    )

    remarks: str | None = None


class EmployeeSalaryUpdate(BaseModel):
    salary_structure_id: int | None = None

    effective_from: date | None = None

    effective_to: date | None = None

    basic_salary: Decimal | None = Field(
        default=None,
        ge=0,
        max_digits=15,
        decimal_places=2,
    )

    gross_salary: Decimal | None = Field(
        default=None,
        ge=0,
        max_digits=15,
        decimal_places=2,
    )

    status: int | None = Field(
        default=None,
        ge=1,
        le=2,
    )

    remarks: str | None = None


class EmployeeSalaryResponse(BaseModel):
    id: int
    user_id: int
    salary_structure_id: int

    effective_from: date
    effective_to: date | None

    basic_salary: Decimal
    gross_salary: Decimal | None

    status: int
    remarks: str | None

    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )


class EmployeeSalaryListResponse(BaseModel):
    items: list[EmployeeSalaryResponse]
    total: int
    page: int
    page_size: int
    total_pages: int