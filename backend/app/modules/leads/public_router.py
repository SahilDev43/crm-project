from fastapi import APIRouter, Depends, status

from app.modules.leads.dependencies import get_lead_service
from app.modules.leads.public_dependencies import (
    get_company_from_api_key,
)
from app.modules.leads.public_schema import PublicLeadCreate
from app.modules.leads.schema import LeadResponse
from app.modules.leads.service import LeadService

router = APIRouter(
    prefix="/public/leads",
    tags=["Public Leads"],
)

@router.post(
    "",
    response_model=LeadResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_public_lead(
    data: PublicLeadCreate,
    company_id: int = Depends(
        get_company_from_api_key
    ),
    service: LeadService = Depends(
        get_lead_service
    ),
):
    return await service.create_public_lead(
        company_id=company_id,
        data=data,
    )