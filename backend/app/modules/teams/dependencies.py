from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.dependencies import get_db
from app.db.dependencies import get_uow
from app.db.unit_of_work import UnitOfWork

from app.modules.teams.repository import TeamRepository
from app.modules.teams.service import TeamService

from app.modules.companies.repository import CompanyRepository
from app.modules.companies.dependencies import get_company_repository

from app.modules.users.repository import UserRepository
from app.modules.users.dependencies import get_user_repository


def get_team_repository(
    db: AsyncSession = Depends(get_db),
) -> TeamRepository:
    return TeamRepository(db)


def get_team_service(
    repo: TeamRepository = Depends(get_team_repository),
    company_repo: CompanyRepository = Depends(
        get_company_repository
    ),
    user_repo: UserRepository = Depends(
        get_user_repository
    ),
    uow: UnitOfWork = Depends(get_uow),
) -> TeamService:

    return TeamService(
        repo=repo,
        uow=uow,
        company_repo=company_repo,
        user_repo=user_repo,
    )