from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class SalaryStructureCreate(BaseModel):
    name: str = Field(min_length=1, max_length=150)
    code: str = Field(min_length=1, max_length=50)
    description: str | None = None
    is_active: bool = True


class SalaryStructureUpdate(BaseModel):
    name: str | None = Field(
        default=None,
        min_length=1,
        max_length=150,
    )
    code: str | None = Field(
        default=None,
        min_length=1,
        max_length=50,
    )
    description: str | None = None
    is_active: bool | None = None


class SalaryStructureResponse(BaseModel):
    id: int
    company_id: int
    name: str
    code: str
    description: str | None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )


class SalaryStructureListResponse(BaseModel):
    items: list[SalaryStructureResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class SalaryStructureComponentCreate(BaseModel):
    salary_component_id: int

    calculation_type: int = Field(
        ge=1,
        le=2,
    )

    calculation_base: int | None = Field(
        default=None,
        ge=1,
        le=3,
    )

    calculation_base_component_id: int | None = None

    value: Decimal = Field(
        ge=0,
        max_digits=15,
        decimal_places=2,
    )

    is_active: bool = True


class SalaryStructureComponentResponse(BaseModel):
    id: int
    salary_structure_id: int
    salary_component_id: int
    calculation_type: int
    calculation_base: int | None
    calculation_base_component_id: int | None
    value: Decimal
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )