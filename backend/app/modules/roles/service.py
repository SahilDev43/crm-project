from app.db.unit_of_work import UnitOfWork
from app.modules.roles.model import Role
from app.modules.roles.repository import RoleRepository
from app.modules.roles.schema import RoleCreate, RoleUpdate
from app.common.exceptions import (
    RoleAlreadyExistsError,
    RoleNotFoundError
)

class RoleService:
    def __init__(
            self,
            repo: RoleRepository,
            uow: UnitOfWork
    ):
        self.repo = repo
        self.uow = uow

    async def create_role(self, data: RoleCreate) -> Role:

        existing = await self.repo.get_by_name(data.name)

        if existing:
            raise RoleAlreadyExistsError()

        role = Role(
            name=data.name,
            description=data.description
        )

        async with self.uow:
            await self.repo.create(role)
            await self.repo.flush()

        await self.repo.refresh(role)

        return role

    async def update_role(
        self,
        role_id: int,
        data: RoleUpdate
    ) -> Role:

        role = await self.repo.get_by_id(role_id)

        if not role:
            raise RoleNotFoundError()

        if data.name is not None and data.name != role.name:
            existing = await self.repo.get_by_name(data.name)

            if existing:
                raise RoleAlreadyExistsError()

        update_data = data.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            setattr(role, field, value)

        async with self.uow:
            await self.repo.update(role)
            await self.repo.flush()

        await self.repo.refresh(role)

        return role

    async def get_roles(self) -> list[Role]:
        return await self.repo.get_all()

    async def get_role(self, role_id: int) -> Role:
        role = await self.repo.get_by_id(role_id)

        if not role:
            raise RoleNotFoundError()
        
        return role

    async def delete_role(self, role_id: int) -> None:
        role = await self.repo.get_by_id(role_id)

        if not role:
            raise RoleNotFoundError()

        async with self.uow:
            await self.repo.delete(role)
            await self.repo.flush()