from fastapi import APIRouter, Depends, status, File, UploadFile

from app.modules.companies.dependencies import get_company_service
from app.modules.companies.schema import (
    CompanyCreate,
    CompanyUpdate,
    CompanyResponse,
)
from app.modules.companies.service import CompanyService
from app.modules.permissions.dependencies import require_permission

router = APIRouter(
    prefix="/companies",
    tags=["Companies"],
)

@router.post(
    "/",
    response_model=CompanyResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[
        Depends(require_permission("companies.create"))
    ]
)
async def create_company(
    data: CompanyCreate,
    service: CompanyService = Depends(get_company_service)
):
    return await service.create_company(data)

@router.get(
    "/",
    response_model=list[CompanyResponse],
    dependencies=[
        Depends(require_permission("companies.view"))
    ]
)

async def list_companies(
    service: CompanyService = Depends(get_company_service)
):
    return await service.get_companies()

@router.get(
    "/{company_id}",
    response_model=CompanyResponse,
    dependencies=[
        Depends(require_permission("companies.view"))
    ],
)
async def get_company(
    company_id: int,
    service: CompanyService = Depends(get_company_service),
):
    return await service.get_company(company_id)


@router.patch(
    "/{company_id}",
    response_model=CompanyResponse,
    dependencies=[
        Depends(require_permission("companies.update"))
    ],
)
async def update_company(
    company_id: int,
    data: CompanyUpdate,
    service: CompanyService = Depends(get_company_service),
):
    return await service.update_company(
        company_id=company_id,
        data=data,
    )


@router.delete(
    "/{company_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[
        Depends(require_permission("companies.delete"))
    ],
)
async def delete_company(
    company_id: int,
    service: CompanyService = Depends(get_company_service),
):
    await service.delete_company(company_id)

@router.post(
    "/{company_id}/logo",
    response_model=CompanyResponse,
    dependencies=[
        Depends(require_permission("companies.update"))
    ],
)
async def upload_company_logo(
    company_id: int,
    logo: UploadFile = File(...),
    service: CompanyService = Depends(get_company_service),
):
    return await service.upload_logo(
        company_id=company_id,
        logo=logo,
    )

@router.delete(
    "/{company_id}/logo",
    response_model=CompanyResponse,
    dependencies=[
        Depends(require_permission("companies.update"))
    ],
)
async def remove_company_logo(
    company_id: int,
    service: CompanyService = Depends(get_company_service),
):
    return await service.remove_logo(company_id)