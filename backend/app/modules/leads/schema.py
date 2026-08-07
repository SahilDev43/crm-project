from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field

class LeadBase(BaseModel):
    first_name: str | None = Field(
        default=None,
        max_length=100,
    )

    email: EmailStr | None = None

    phone: str | None = Field(
        default=None,
        max_length=50,
    )

    country_code: str | None = Field(
        default=None,
        max_length=20,
    )

    client_company_name: str | None = Field(
        default=None,
        max_length=255,
    )

    message: str | None = None

    website_url: str | None = Field(
        default=None,
        max_length=500,
    )

    industry: str | None = Field(
        default=None,
        max_length=255,
    )

    interested: str | None = Field(
        default=None,
        max_length=255,
    )

    skype_whatsapp: str | None = Field(
        default=None,
        max_length=255,
    )

    link: str | None = Field(
        default=None,
        max_length=500,
    )

    first_page: str | None = Field(
        default=None,
        max_length=1000,
    )

    pre_page: str | None = Field(
        default=None,
        max_length=1000,
    )

    utm_campaign: str | None = Field(default=None, max_length=255)
    utm_medium: str | None = Field(default=None, max_length=255)
    utm_source: str | None = Field(default=None, max_length=255)
    utm_term: str | None = Field(default=None, max_length=255)

    ip: str | None = Field(
        default=None,
        max_length=45,
    )

    city: str | None = Field(
        default=None,
        max_length=100,
    )

    country: str | None = Field(
        default=None,
        max_length=100,
    )

    lead_type: str | None = Field(
        default=None,
        max_length=50,
    )

    source: str | None = Field(
        default=None,
        max_length=100,
    )

    tag: str | None = Field(
        default=None,
        max_length=255,
    )

class LeadCreate(LeadBase):
    company_id: int

    external_lead_id: str | None = Field(
        default=None,
        max_length=100,
    )

class LeadUpdate(BaseModel):
    first_name: str | None = Field(default=None, max_length=100)
    email: EmailStr | None = None
    phone: str | None = Field(default=None, max_length=50)
    country_code: str | None = Field(default=None, max_length=20)
    client_company_name: str | None = Field(default=None, max_length=255)

    message: str | None = None
    website_url: str | None = Field(default=None, max_length=500)
    industry: str | None = Field(default=None, max_length=255)
    interested: str | None = Field(default=None, max_length=255)
    skype_whatsapp: str | None = Field(default=None, max_length=255)
    link: str | None = Field(default=None, max_length=500)

    first_page: str | None = Field(default=None, max_length=1000)
    pre_page: str | None = Field(default=None, max_length=1000)

    utm_campaign: str | None = Field(default=None, max_length=255)
    utm_medium: str | None = Field(default=None, max_length=255)
    utm_source: str | None = Field(default=None, max_length=255)
    utm_term: str | None = Field(default=None, max_length=255)

    ip: str | None = Field(default=None, max_length=45)
    city: str | None = Field(default=None, max_length=100)
    country: str | None = Field(default=None, max_length=100)

    lead_type: str | None = Field(default=None, max_length=50)
    source: str | None = Field(default=None, max_length=100)
    tag: str | None = Field(default=None, max_length=255)

    status_id: int | None = None

class LeadStatusResponse(BaseModel):
    id: int
    name: str
    code: str
    is_active: bool

    model_config = ConfigDict(from_attributes=True)

class LeadResponse(LeadBase):
    id: int
    external_lead_id: str | None
    company_id: int
    status_id: int | None
    is_converted: bool

    status: LeadStatusResponse | None = None

    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)