from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class AccessTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class MeResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: EmailStr
    phone: str | None = None
    role_id: int | None = None
    company_id: int | None = None
    profile_image: str | None = None
    is_active: bool
    is_verified: bool
    created_at: datetime
    updated_at: datetime
    is_deleted: bool
    permissions: list[str] = []

    model_config = ConfigDict(from_attributes=True)