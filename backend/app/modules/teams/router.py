from fastapi import APIRouter, Depends, status

from app.modules.permissions.dependencies import require_permission

from app.modules.teams.dependencies import get_team_service
from app.modules.teams.schema import (
    TeamCreate,
    TeamUpdate,
    TeamResponse,
    TeamMemberCreate,
    TeamMemberResponse,
)
from app.modules.teams.service import TeamService


router = APIRouter(
    prefix="/teams",
    tags=["Teams"],
)


@router.post(
    "",
    response_model=TeamResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[
        Depends(require_permission("teams.create"))
    ],
)
async def create_team(
    data: TeamCreate,
    service: TeamService = Depends(get_team_service),
):
    return await service.create_team(
        data=data,
    )


@router.get(
    "",
    response_model=list[TeamResponse],
    dependencies=[
        Depends(require_permission("teams.view"))
    ],
)
async def get_teams(
    company_id: int | None = None,
    service: TeamService = Depends(get_team_service),
):
    return await service.get_teams(
        company_id=company_id,
    )


@router.get(
    "/{team_id}",
    response_model=TeamResponse,
    dependencies=[
        Depends(require_permission("teams.view"))
    ],
)
async def get_team(
    team_id: int,
    service: TeamService = Depends(get_team_service),
):
    return await service.get_team(
        team_id=team_id,
    )


@router.patch(
    "/{team_id}",
    response_model=TeamResponse,
    dependencies=[
        Depends(require_permission("teams.update"))
    ],
)
async def update_team(
    team_id: int,
    data: TeamUpdate,
    service: TeamService = Depends(get_team_service),
):
    return await service.update_team(
        team_id=team_id,
        data=data,
    )


@router.delete(
    "/{team_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[
        Depends(require_permission("teams.delete"))
    ],
)
async def delete_team(
    team_id: int,
    service: TeamService = Depends(get_team_service),
):
    await service.delete_team(
        team_id=team_id,
    )


@router.post(
    "/{team_id}/members",
    response_model=TeamMemberResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[
        Depends(require_permission("teams.manage_members"))
    ],
)
async def add_team_member(
    team_id: int,
    data: TeamMemberCreate,
    service: TeamService = Depends(get_team_service),
):
    return await service.add_member(
        team_id=team_id,
        data=data,
    )


@router.delete(
    "/{team_id}/members/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[
        Depends(require_permission("teams.manage_members"))
    ],
)
async def remove_team_member(
    team_id: int,
    user_id: int,
    service: TeamService = Depends(get_team_service),
):
    await service.remove_member(
        team_id=team_id,
        user_id=user_id,
    )