from app.common.exceptions import (
    UserAlreadyExistsError,
    UserNotFoundError,
    RoleNotFoundError
)
from app.core.security import hash_password
from app.modules.users.model import User
from app.modules.users.repository import UserRepository
from app.modules.roles.repository import RoleRepository
from app.modules.users.schema import UserCreate, UserUpdate
from app.db.unit_of_work import UnitOfWork

class UserService:

    def __init__(self, repo: UserRepository, uow: UnitOfWork, role_repo: RoleRepository):
        self.repo = repo
        self.uow = uow
        self.role_repo = role_repo

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

        async with self.uow:

            await self.repo.create(user)
            await self.repo.flush()

        await self.repo.refresh(user)

        return user

    async def get_users(self):
        return await self.repo.get_all()

    async def get_user(self, user_id: int):

        user = await self.repo.get_by_id(user_id)

        if not user:
            raise UserNotFoundError()

        return user

    async def update_user(
            self,
            user_id: int,
            data: UserUpdate,
    ) -> User:

        user = await self.repo.get_by_id(user_id)

        if not user:
            raise UserNotFoundError()

        update_data = data.model_dump(exclude_unset=True)

        #Check duplicate email only when email is being changed
        if "email" in update_data:
            existing = await self.repo.get_by_email(update_data["email"])

            if existing and existing.id != user.id:
                raise UserAlreadyExistsError()

        #password must be stored directly
        if "password" in update_data:
            user.password_hash = hash_password(
                update_data.pop("password")
            )

        if "role_id" in update_data and update_data["role_id"] is not None:
            role = await self.role_repo.get_by_id(
                update_data["role_id"]
            )

            if not role:
                raise RoleNotFoundError()

        #update remaining fields
        for field, value in update_data.items():
            setattr(user, field, value)

        async with self.uow:
            await self.repo.flush()

        await self.repo.refresh(user)

        return user

    async def delete_user(
            self,
            user_id: int
    ) -> None:

        user = await self.repo.get_by_id(user_id)

        if not user:
            raise UserNotFoundError()

        async with self.uow:
            await self.repo.delete(user)
            await self.repo.flush()