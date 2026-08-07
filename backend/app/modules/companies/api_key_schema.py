from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class CompanyApiKeyCreate(BaseModel):
    name: str = Field(
        ...,
        min_length=2,
        max_length=100,
    )


class CompanyApiKeyResponse(BaseModel):
    id: int
    company_id: int
    name: str
    key_prefix: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CompanyApiKeyCreatedResponse(CompanyApiKeyResponse):
    api_key: str