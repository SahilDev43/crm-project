from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.dependencies import get_db
from app.db.dependencies import get_uow
from app.db.unit_of_work import UnitOfWork

from app.modules.users.repository import UserRepository
from app.modules.users.service import UserService

def get_user_repository(
        db: AsyncSession = Depends(get_db),
)-> UserRepository : 
    return UserRepository(db)

def get_user_service(
        repo: UserRepository = Depends(get_user_repository),
        uow: UnitOfWork = Depends(get_uow)
) -> UserService:
    return UserService(
        repo=repo,
        uow=uow
        )