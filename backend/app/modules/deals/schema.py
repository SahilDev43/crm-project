from datetime import datetime

from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class DealBase(BaseModel):
    title: str
    client_name: str

    project_type_id: int | None = None
    platform_id: int | None = None
    deal_status_id: int

    platform_external_id: str | None = None
    job_description: str | None = None
    url: str | None = None

    client_email: str | None = None
    client_phone: str | None = None

    contact_email: str | None = None
    contact_phone: str | None = None
    contact_description: str | None = None

    budget: str | None = None
    meeting_time: str | None = None

    company_id: int

    lead_id: int | None = None
    external_lead_id: str | None = None

    accepted_by: int | None = None
    assigned_to: int | None = None
    status_meeting_by_user_id: int | None = None

    status: int = 1
    type: int = 0


class DealCreate(DealBase):
    pass


class DealUpdate(BaseModel):
    title: str | None = None
    client_name: str | None = None

    project_type_id: int | None = None
    platform_id: int | None = None
    deal_status_id: int | None = None

    platform_external_id: str | None = None
    job_description: str | None = None
    url: str | None = None

    client_email: str | None = None
    client_phone: str | None = None

    contact_email: str | None = None
    contact_phone: str | None = None
    contact_description: str | None = None

    budget: str | None = None
    meeting_time: str | None = None

    company_id: int | None = None

    lead_id: int | None = None
    external_lead_id: str | None = None

    accepted_by: int | None = None
    assigned_to: int | None = None
    status_meeting_by_user_id: int | None = None

    status: int | None = None
    type: int | None = None


class DealResponse(DealBase):
    id: int

    created_by: int
    updated_by: int | None = None

    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class DealListResponse(BaseModel):
    items: list[DealResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

class DealAssign(BaseModel):
    assigned_to : int

class DealStatusUpdate(BaseModel):
    deal_status_id: int


class DealStatusResponse(BaseModel):
    id: int
    name: str
    code: str
    is_active: bool

    model_config = ConfigDict(from_attributes=True)


class DealMasterDataResponse(BaseModel):
    id: int
    name: str

    model_config = ConfigDict(from_attributes=True)


class DealCommentCreate(BaseModel):
    content: str = Field(min_length=1, max_length=5000)


class DealFeedResponse(BaseModel):
    id: int
    deal_id: int
    user_id: int | None
    actor_name: str | None
    event_type: str
    content: str
    metadata_json: dict[str, Any] | None
    created_at: datetime
    updated_at: datetime
