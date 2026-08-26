from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

class PermissionCreate(BaseModel):
    name: str = Field(..., min_length=3, max_length=100)
    description: str | None = Field(default=None, max_length=100)

class PermissionUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=3, max_length=100)
    description: str | None = Field(default=None, max_length=100)

class PermissionResponse(BaseModel):
    id: int
    name: str
    description: str | None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class PermissionListResponse(BaseModel):
    items: list[PermissionResponse]
    total: int
    page: int
    page_size: int
    total_pages: int