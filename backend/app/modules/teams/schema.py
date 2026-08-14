from datetime import datetime

from pydantic import BaseModel, ConfigDict


class TeamBase(BaseModel):
    company_id: int
    name: str
    description: str | None = None
    is_active: bool = True


class TeamCreate(TeamBase):
    pass


class TeamUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    is_active: bool | None = None


class TeamMemberCreate(BaseModel):
    user_id: int
    is_team_lead: bool = False


class TeamMemberResponse(BaseModel):
    id: int
    team_id: int
    user_id: int
    is_team_lead: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )


class TeamResponse(TeamBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )


class TeamListResponse(BaseModel):
    items: list[TeamResponse]
    total: int