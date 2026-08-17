from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class SalaryComponentCreate(BaseModel):
    name: str
    code: str
    component_type: int = Field(ge=1, le=2)
    description: str | None = None
    is_active: bool = True


class SalaryComponentUpdate(BaseModel):
    name: str | None = None
    code: str | None = None
    component_type: int | None = Field(default=None, ge=1, le=2)
    description: str | None = None
    is_active: bool | None = None


class SalaryComponentResponse(BaseModel):
    id: int
    name: str
    code: str
    component_type: int
    description: str | None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )


class SalaryComponentListResponse(BaseModel):
    items: list[SalaryComponentResponse]
    total: int
    page: int
    page_size: int
    total_pages: int