from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class CompanyCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)

    company_address: str | None = None
    gst_number: str | None = Field(
        default=None,
        max_length=20,
    )
    state: str | None = Field(
        default=None,
        max_length=100,
    )
    state_code: str | None = Field(
        default=None,
        max_length=10,
    )

class CompanyUpdate(BaseModel):
    name: str | None = Field(
        default=None,
        min_length=2,
        max_length=255
    )

    company_address: str | None = None

    gst_number: str | None = Field(
        default=None,
        max_length=20,
    )

    state: str | None = Field(
        default=None,
        max_length=100,
    )

    state_code: str | None = Field(
        default=None,
        max_length=10,
    )

    is_active: bool | None = None

class CompanyResponse(BaseModel):
    id: int
    name: str
    logo: str | None
    company_address: str | None
    gst_number: str | None
    state: str | None
    state_code: str | None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)