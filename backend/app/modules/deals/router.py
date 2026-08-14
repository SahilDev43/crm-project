from fastapi import APIRouter, Depends, status, Query

from app.core.jwt import get_current_user
from app.modules.deals.dependencies import get_deal_service
from app.modules.deals.schema import (
    DealCreate,
    DealUpdate,
    DealResponse,
    DealAssign,
    DealStatusUpdate
)
from app.modules.deals.service import DealService
from app.modules.deals.schema import DealListResponse
from app.modules.permissions.dependencies import require_permission

router = APIRouter(
    prefix="/deals",
    tags=["Deals"],
)


@router.post(
    "",
    response_model=DealResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[
        Depends(require_permission("deals.create"))
    ],
)
async def create_deal(
    data: DealCreate,
    service: DealService = Depends(get_deal_service),
    current_user=Depends(get_current_user),
):
    return await service.create_deal(
        data=data,
        current_user_id=current_user.id,
    )


@router.get(
    "",
    response_model=DealListResponse,
    dependencies=[
        Depends(require_permission("deals.view"))
    ],
)
async def get_deals(
    company_id: int | None = Query(
        default=None
    ),
    deal_status_id: int | None = Query(
        default=None
    ),
    platform_id: int | None = Query(
        default=None
    ),
    project_type_id: int | None = Query(
        default=None
    ),
    assigned_to: int | None = Query(
        default=None
    ),
    search: str | None = Query(
        default=None,
        min_length=1
    ),
    page: int = Query(
        default=1,
        ge=1,
    ),
    page_size: int = Query(
        default=10,
        ge=1,
        le=100,
    ),
    service: DealService = Depends(
        get_deal_service
    ),
):

    return await service.get_deals(
        company_id=company_id,
        deal_status_id=deal_status_id,
        platform_id=platform_id,
        project_type_id=project_type_id,
        assigned_to=assigned_to,
        search=search,
        page=page,
        page_size=page_size,
    )

@router.patch(
    "/{deal_id}/assign",
    response_model=DealResponse,
    dependencies=[
    Depends(require_permission("deals.assign"))
]
)

async def assign_deal(
    deal_id: int,
    data: DealAssign,
    service: DealService = Depends(get_deal_service),
    current_user= Depends(get_current_user),
):

    return await service.assign_deal(
        deal_id=deal_id,
        assigned_to=data.assigned_to,
        current_user_id=current_user.id
    )

@router.patch(
    "/{deal_id}/status",
    response_model=DealResponse,
    dependencies=[
        Depends(require_permission("deals.change_status"))
    ],   
)
async def update_deal_status(
    deal_id: int,
    data: DealStatusUpdate,
    service: DealService = Depends(get_deal_service),
    current_user=Depends(get_current_user)
):
    return await service.update_deal_status(
        deal_id=deal_id,
        deal_status_id=data.deal_status_id,
        current_user_id=current_user.id
    )

@router.get(
    "/{deal_id}",
    response_model=DealResponse,
    dependencies=[
        Depends(require_permission("deals.view"))
    ],
)
async def get_deal(
    deal_id: int,
    service: DealService = Depends(get_deal_service),
):
    return await service.get_deal(
        deal_id=deal_id,
    )

@router.patch(
    "/{deal_id}",
    response_model=DealResponse,
    dependencies=[
    Depends(require_permission("deals.update"))
]
)
async def update_deal(
    deal_id: int,
    data: DealUpdate,
    service: DealService = Depends(get_deal_service),
    current_user=Depends(get_current_user),
):
    return await service.update_deal(
        deal_id=deal_id,
        data=data,
        current_user_id=current_user.id,
    )


@router.delete(
    "/{deal_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[
        Depends(require_permission("deals.delete"))
    ],
)
async def delete_deal(
    deal_id: int,
    service: DealService = Depends(get_deal_service),
):
    await service.delete_deal(deal_id)