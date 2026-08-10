from fastapi import Depends, Header
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.dependencies import get_db
from app.modules.companies.api_key_repository import CompanyApiKeyRepository
from app.modules.companies.api_key_service import CompanyApiKeyService
from app.modules.companies.api_key_dependencies import (
    get_company_api_key_service,
)
from app.common.exceptions import InvalidApiKeyError

async def get_company_from_api_key(
    x_api_key: str = Header(..., alias="X-API-Key"),
    service: CompanyApiKeyService = Depends(
        get_company_api_key_service
    ),
):
    api_key = await service.authenticate_api_key(x_api_key)

    if not api_key:
        raise InvalidApiKeyError()

    return api_key.company_id