from fastapi import APIRouter, Depends, status

from app.modules.leads.dependencies import get_lead_service
from app.modules.leads.schema import (
    LeadCreate,
    LeadUpdate,
    LeadResponse,
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
    response_model=list[LeadResponse],
    dependencies=[
        Depends(require_permission("leads.view"))
    ],
)
async def get_leads(
    service: LeadService = Depends(get_lead_service),
):
    return await service.get_leads()


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


@router.post(
    "",
    response_model=LeadResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[
        Depends(require_permission("leads.create"))
    ],
)
async def create_lead(
    data: LeadCreate,
    service: LeadService = Depends(get_lead_service),
):
    return await service.create_lead(data)


@router.patch(
    "/{lead_id}",
    response_model=LeadResponse,
    dependencies=[
        Depends(require_permission("leads.update"))
    ],
)
async def update_lead(
    lead_id: int,
    data: LeadUpdate,
    service: LeadService = Depends(get_lead_service),
):
    return await service.update_lead(
        lead_id=lead_id,
        data=data,
    )


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