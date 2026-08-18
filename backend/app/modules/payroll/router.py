from fastapi import APIRouter, Depends, Query

from app.core.jwt import get_current_user

from app.modules.payroll.dependencies import (
    get_payroll_repository,
)
from app.modules.payroll.repository import PayrollRepository
from app.modules.payroll.schema import (
    PayrollProcessRequest,
    PayrollResponse,
    PayrollListResponse,
    PayrollDetailResponse,
    PayrollItemResponse,
    PayrollUpdateRequest
)
from app.modules.payroll.service import PayrollService


router = APIRouter(
    prefix="/payrolls",
    tags=["Payroll"],
)


@router.post(
    "/process",
    response_model=PayrollResponse,
)
async def process_payroll(
    data: PayrollProcessRequest,
    repository: PayrollRepository = Depends(
        get_payroll_repository
    ),
    current_user=Depends(get_current_user),
):
    service = PayrollService(repository)

    return await service.process_payroll(
        user_id=data.user_id,
        payroll_month=data.payroll_month,
        payroll_year=data.payroll_year,
        company_id=current_user.company_id,
    )

@router.get(
    "",
    response_model=PayrollListResponse,
)
async def get_payrolls(
    user_id: int | None = Query(
        default=None,
        gt=0,
    ),
    payroll_month: int | None = Query(
        default=None,
        ge=1,
        le=12,
    ),
    payroll_year: int | None = Query(
        default=None,
        ge=2000,
        le=2100,
    ),
    status: int | None = Query(
        default=None,
    ),
    page: int = Query(
        default=1,
        ge=1,
    ),
    page_size: int = Query(
        default=20,
        ge=1,
        le=100,
    ),
    repository: PayrollRepository = Depends(
        get_payroll_repository
    ),
    current_user=Depends(get_current_user),
):
    service = PayrollService(repository)

    return await service.get_all(
        company_id=current_user.company_id,
        user_id=user_id,
        payroll_month=payroll_month,
        payroll_year=payroll_year,
        status=status,
        page=page,
        page_size=page_size,
    )

@router.get(
    "/{payroll_id}",
    response_model=PayrollDetailResponse,
)
async def get_payroll(
    payroll_id: int,
    repository: PayrollRepository = Depends(
        get_payroll_repository
    ),
    current_user=Depends(get_current_user),
):
    service = PayrollService(repository)

    return await service.get_by_id(
        payroll_id=payroll_id,
        company_id=current_user.company_id,
    )

@router.get(
    "/{payroll_id}/items",
    response_model=list[PayrollItemResponse],
)
async def get_payroll_items(
    payroll_id: int,
    repository: PayrollRepository = Depends(
        get_payroll_repository
    ),
    current_user=Depends(get_current_user),
):
    service = PayrollService(repository)

    return await service.get_items(
        payroll_id=payroll_id,
        company_id=current_user.company_id,
    )

@router.patch(
    "/{payroll_id}/pay",
    response_model=PayrollResponse
)
async def mark_payroll_as_paid(
    payroll_id: int,
    repository: PayrollRepository = Depends(
        get_payroll_repository
    ),
    current_user=Depends(get_current_user)
):
    service = PayrollService(repository)

    return await service.mark_as_paid(
        payroll_id=payroll_id,
        company_id=current_user.company_id
    )

@router.patch(
    "/{payroll_id}",
    response_model=PayrollResponse,
)
async def update_payroll(
    payroll_id: int,
    data: PayrollUpdateRequest,
    repository: PayrollRepository = Depends(
        get_payroll_repository
    ),
    current_user=Depends(get_current_user),
):
    service = PayrollService(repository)

    return await service.update(
        payroll_id=payroll_id,
        data=data,
        company_id=current_user.company_id,
    )