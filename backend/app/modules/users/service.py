from fastapi import HTTPException, status

from app.common.exceptions import (
    UserAlreadyExistsError,
    UserNotFoundError,
)
from app.core.security import hash_password
from app.modules.users.model import User
from app.modules.users.repository import UserRepository
from app.modules.users.schema import UserCreate

class UserService:

    def __init__(self, repo: UserRepository):
        self.repo = repo

    async def create_user(self, data: UserCreate) -> User:

        existing = await self.repo.get_by_email(data.email)

        if existing:
            raise UserAlreadyExistsError()

        user = User(
         first_name=data.first_name,
         last_name=data.last_name,
         email=data.email,
         phone=data.phone,
         password_hash=hash_password(data.password),
        )

        return await self.repo.create(user)

    async def get_users(self):
        return await self.repo.get_all()

    async def get_user(self, user_id: int):

        user = await self.repo.get_by_id(user_id)

        if not user:
            raise UserNotFoundError

        return user