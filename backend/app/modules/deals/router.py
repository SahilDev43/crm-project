from fastapi import APIRouter, Depends, status

from app.core.jwt import get_current_user
from app.modules.deals.dependencies import get_deal_service
from app.modules.deals.schema import (
    DealCreate,
    DealUpdate,
    DealResponse,
)
from app.modules.deals.service import DealService


router = APIRouter(
    prefix="/deals",
    tags=["Deals"],
)


@router.post(
    "",
    response_model=DealResponse,
    status_code=status.HTTP_201_CREATED,
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
    response_model=list[DealResponse],
)
async def get_deals(
    company_id: int | None = None,
    service: DealService = Depends(get_deal_service),
):
    return await service.get_deals(
        company_id=company_id,
    )


@router.get(
    "/{deal_id}",
    response_model=DealResponse,
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
)
async def delete_deal(
    deal_id: int,
    service: DealService = Depends(get_deal_service),
):
    await service.delete_deal(deal_id)