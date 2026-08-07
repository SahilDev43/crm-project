from fastapi import APIRouter, Depends, status, File, UploadFile

from app.modules.companies.dependencies import get_company_service
from app.modules.companies.schema import (
    CompanyCreate,
    CompanyUpdate,
    CompanyResponse,
)
from app.modules.companies.service import CompanyService
from app.modules.permissions.dependencies import require_permission
from app.modules.companies.api_key_dependencies import (
    get_company_api_key_service,
)
from app.modules.companies.api_key_service import CompanyApiKeyService
from app.modules.companies.api_key_schema import (
    CompanyApiKeyCreate,
    CompanyApiKeyResponse,
    CompanyApiKeyCreatedResponse,
)

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

@router.post(
    "/{company_id}/api-keys",
    response_model=CompanyApiKeyCreatedResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[
        Depends(require_permission("companies.update"))
    ],
)
async def create_company_api_key(
    company_id: int,
    data: CompanyApiKeyCreate,
    service: CompanyApiKeyService = Depends(
        get_company_api_key_service
    ),
):
    api_key, plain_api_key = await service.create_api_key(
        company_id=company_id,
        data=data,
    )

    return CompanyApiKeyCreatedResponse(
        id=api_key.id,
        company_id=api_key.company_id,
        name=api_key.name,
        key_prefix=api_key.key_prefix,
        is_active=api_key.is_active,
        created_at=api_key.created_at,
        updated_at=api_key.updated_at,
        api_key=plain_api_key,
    )

@router.get(
    "/{company_id}/api-keys",
    response_model=list[CompanyApiKeyResponse],
    dependencies=[
        Depends(require_permission("companies.view"))
    ],
)
async def get_company_api_keys(
    company_id: int,
    service: CompanyApiKeyService = Depends(
        get_company_api_key_service
    ),
):
    return await service.get_company_api_keys(company_id)

@router.delete(
    "/{company_id}/api-keys/{key_id}",
    response_model=CompanyApiKeyResponse,
    dependencies=[
        Depends(require_permission("companies.update"))
    ],
)
async def revoke_company_api_key(
    company_id: int,
    key_id: int,
    service: CompanyApiKeyService = Depends(
        get_company_api_key_service
    ),
):
    return await service.revoke_api_key(
        company_id=company_id,
        key_id=key_id,
    )
