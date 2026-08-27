from fastapi import APIRouter, Depends, Query, status

from app.modules.leads.dependencies import get_lead_service
from app.modules.leads.schema import (
    LeadResponse,
    LeadListResponse,
    LeadStatusResponse,
)
from app.modules.leads.service import LeadService
from app.modules.permissions.dependencies import require_permission


router = APIRouter(
    prefix="/leads",
    tags=["Leads"],
)

@router.get(
    "/statuses",
    response_model=list[LeadStatusResponse],
    dependencies=[
        Depends(require_permission("leads.view"))
    ],
)
async def get_lead_statuses(
    service: LeadService = Depends(get_lead_service),
):
    return await service.get_statuses()


@router.get(
    "",
    response_model=LeadListResponse,
    dependencies=[
        Depends(require_permission("leads.view"))
    ],
)
async def get_leads(
    company_id: int | None = Query(default=None),
    status_id: int | None = Query(default=None),
    lead_type: str | None = Query(default=None, min_length=1),
    search: str | None = Query(default=None, min_length=1),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=100),
    service: LeadService = Depends(get_lead_service),
):
    return await service.get_leads(
        company_id=company_id,
        status_id=status_id,
        lead_type=lead_type,
        search=search,
        page=page,
        page_size=page_size,
    )


@router.get(
    "/{lead_id}",
    response_model=LeadResponse,
    dependencies=[
        Depends(require_permission("leads.view"))
    ],
)
async def get_lead(
    lead_id: int,
    service: LeadService = Depends(get_lead_service),
):
    return await service.get_lead(lead_id)


@router.delete(
    "/{lead_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[
        Depends(require_permission("leads.delete"))
    ],
)
async def delete_lead(
    lead_id: int,
    service: LeadService = Depends(get_lead_service),
):
    await service.delete_lead(lead_id)
