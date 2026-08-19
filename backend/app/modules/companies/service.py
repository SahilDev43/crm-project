from app.common.exceptions import (
    CompanyAlreadyExistsError,
    CompanyNotFoundError,
)
from app.db.unit_of_work import UnitOfWork
from app.modules.companies.model import Company
from app.modules.companies.repository import CompanyRepository
from app.modules.companies.schema import (
    CompanyCreate,
    CompanyUpdate,
)
from app.common.storage import StorageService
from fastapi import UploadFile

class CompanyService:

    def __init__(
        self,
        repo: CompanyRepository,
        uow: UnitOfWork,
        storage: StorageService
    ):
        self.repo = repo
        self.uow = uow
        self.storage = storage

    async def create_company(self, data: CompanyCreate) -> Company:

        existing = await self.repo.get_by_name(data.name)

        if existing:
            raise CompanyAlreadyExistsError()

        company = Company(
            name=data.name,
            company_address=data.company_address,
            gst_number=data.gst_number,
            state=data.state,
            state_code=data.state_code,
        )

        async with self.uow:
            await self.repo.create(company)
            await self.repo.flush()

        await self.repo.refresh(company)

        return company

    async def get_companies(self) -> list[Company]:
        return await self.repo.get_all()

    async def get_company(
        self,
        company_id: int
    ) -> Company:

        company = await self.repo.get_by_id(company_id)

        if not company:
            raise CompanyNotFoundError()

        return company

    async def update_company(
        self,
        company_id: int,
        data: CompanyUpdate
    ) -> Company:

        company = await self.repo.get_by_id(company_id)

        if not company:
            raise CompanyNotFoundError()

        update_data = data.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            setattr(company, field, value)

        if "name" in update_data:
            existing = await self.repo.get_by_name(update_data["name"])

            if existing and existing.id != company.id:
                raise CompanyAlreadyExistsError()

        for field, value in update_data.items():
            setattr(company, field, value)

        async with self.uow:
            await self.repo.flush()

        await self.repo.refresh(company)

        return company


    async def delete_company(
        self,
        company_id: int
    ) -> None:

        company = await self.repo.get_by_id(company_id)

        if not company:
            raise CompanyNotFoundError()

        async with self.uow:
            await self.repo.delete(company)
            await self.repo.flush()

    async def upload_logo(
        self,
        company_id: int,
        logo: UploadFile
    ) -> Company:

        company = await self.repo.get_by_id(company_id)

        if not company:
            raise CompanyNotFoundError()

        old_logo = company.logo

        new_logo = await self.storage.save_image(
            file=logo,
            folder=f"companies/{company.id}"
        )

        company.logo = new_logo

        try:
            async with self.uow:
                await self.repo.flush()
        except:
            # Database update failed, so don't leave
            # the newly uploaded file behind.
            self.storage.delete_file(new_logo)
            raise

        #Delete old logo only after DB updated succeeds.
        if old_logo:
            self.storage.delete_file(old_logo)

        await self.repo.refresh(company)

        return company

    async def remove_logo(
        self,
        company_id: int
    ) -> Company:

        company = await self.repo.get_by_id(company_id)

        if not company:
            raise CompanyNotFoundError()

        old_logo = company.logo

        company.logo = None

        async with self.uow:
            await self.repo.flush()

        # Delete physical file only after DB update succeeds
        if old_logo:
            self.storage.delete_file(old_logo)

        await self.repo.refresh(company)

        return company