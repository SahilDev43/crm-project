from app.common.exceptions import (
    CompanyNotFoundError,
)

from app.modules.teams.model import Team
from app.modules.teams.member_model import TeamMember
from app.modules.teams.repository import TeamRepository
from app.modules.teams.schema import (
    TeamCreate,
    TeamUpdate,
    TeamMemberCreate,
)

from app.modules.companies.repository import CompanyRepository
from app.modules.users.repository import UserRepository

from app.db.unit_of_work import UnitOfWork


class TeamService:

    def __init__(
        self,
        repo: TeamRepository,
        uow: UnitOfWork,
        company_repo: CompanyRepository,
        user_repo: UserRepository,
    ):
        self.repo = repo
        self.uow = uow
        self.company_repo = company_repo
        self.user_repo = user_repo

    async def create_team(
        self,
        data: TeamCreate,
    ) -> Team:

        # Validate company
        company = await self.company_repo.get_by_id(
            data.company_id
        )

        if not company:
            raise CompanyNotFoundError()

        if not company.is_active:
            raise CompanyNotFoundError()

        team = Team(
            company_id=data.company_id,
            name=data.name,
            description=data.description,
            is_active=data.is_active,
        )

        async with self.uow:

            await self.repo.create(team)
            await self.repo.flush()

        await self.repo.refresh(team)

        return team

    async def get_teams(
        self,
        company_id: int | None = None,
    ) -> list[Team]:

        return await self.repo.get_all(
            company_id=company_id
        )

    async def get_team(
        self,
        team_id: int,
    ) -> Team:

        return await self.repo.get_by_id(
            team_id
        )

    async def update_team(
        self,
        team_id: int,
        data: TeamUpdate,
    ) -> Team:

        team = await self.repo.get_by_id(
            team_id
        )

        if not team:
            return None

        update_data = data.model_dump(
            exclude_unset=True
        )

        for field, value in update_data.items():
            setattr(team, field, value)

        async with self.uow:

            await self.repo.flush()

        await self.repo.refresh(team)

        return team

    async def delete_team(
        self,
        team_id: int,
    ) -> None:

        team = await self.repo.get_by_id(
            team_id
        )

        if not team:
            return

        async with self.uow:

            await self.repo.delete(team)
            await self.repo.flush()

    async def add_member(
        self,
        team_id: int,
        data: TeamMemberCreate,
    ) -> TeamMember:

        team = await self.repo.get_by_id(
            team_id
        )

        if not team:
            return None

        user = await self.user_repo.get_by_id(
            data.user_id
        )

        if not user:
            return None

        existing = await self.repo.get_member(
            team_id=team_id,
            user_id=data.user_id,
        )

        if existing:
            return existing

        member = TeamMember(
            team_id=team_id,
            user_id=data.user_id,
            is_team_lead=data.is_team_lead,
        )

        async with self.uow:

            await self.repo.add_member(member)
            await self.repo.flush()

        await self.repo.db.refresh(member)

        return member

    async def remove_member(
        self,
        team_id: int,
        user_id: int,
    ) -> None:

        member = await self.repo.get_member(
            team_id=team_id,
            user_id=user_id,
        )

        if not member:
            return

        async with self.uow:

            await self.repo.remove_member(member)
            await self.repo.flush()