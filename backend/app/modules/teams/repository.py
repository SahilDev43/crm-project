from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.base_repository import BaseRepository
from app.modules.teams.model import Team
from app.modules.teams.member_model import TeamMember

class TeamRepository(BaseRepository):

    async def get_by_id(
        self,
        team_id: int,
    ) -> Team | None:

        result = await self.db.execute(
            select(Team).where(
                Team.id == team_id
            )
        )

        return result.scalar_one_or_none

    async def get_all(
        self,
        company_id: int | None = None
    ) -> list[Team]:

        query = select(Team)

        if company_id is not None:
            query = query.where(
                Team.company_id == company_id
            )

        query = query.order_by(Team.id)

        result = await self.db.execute(query)

        return list(result.scalars().all())

    async def create(
        self,
        team: Team
    ) -> Team:

        self.db.add(team)

        return team

    async def update(
        self,
        team: Team
    ) -> Team:

        return team

    async def delete(
        self,
        team: Team
    ) -> None:

        team.is_active = False

    async def get_member(
        self,
        team_id: int,
        user_id: int
    ) -> TeamMember | None:

        result = await self.db.execute(
            select(TeamMember).where(
                TeamMember.team_id == team_id,
                TeamMember.user_id == user_id
            )
        )

        return result.scalar_one_or_none()

    async def get_members(
        self,
        team_id: int
    ) -> list[TeamMember]:

        result = await self.db.execute(
            select(TeamMember).where(
                TeamMember.team_id == team_id
            )
            .order_by(TeamMember.id)
        )

        return list(result.scalars().all())

    async def add_member(
        self,
        member: TeamMember
    ) -> TeamMember:

        self.db.add(member)

        return member

    async def remove_member(
        self,
        member: TeamMember
    ) -> None:

        await self.db.delete(member)