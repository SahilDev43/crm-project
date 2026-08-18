from datetime import date

from fastapi import APIRouter, Depends, Request, status, Query

from app.core.jwt import get_current_user
from app.modules.permissions.dependencies import require_permission

from app.modules.attendance.dependencies import get_attendance_service
from app.modules.attendance.schema import (
    AttendanceResponse,
    AttendanceListResponse,
    AttendanceSessionResponse,
    AttendanceUpdate
)
from app.modules.attendance.service import AttendanceService


router = APIRouter(
    prefix="/attendance",
    tags=["Attendance"],
)


@router.post(
    "/punch-in",
    response_model=AttendanceSessionResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[
        Depends(require_permission("attendance.punch"))
    ],
)
async def punch_in(
    request: Request,
    service: AttendanceService = Depends(
        get_attendance_service
    ),
    current_user=Depends(get_current_user),
):
    ip_address = request.client.host if request.client else None

    return await service.punch_in(
        user_id=current_user.id,
        company_id=current_user.company_id,
        ip_address=ip_address,
    )


@router.post(
    "/punch-out",
    response_model=AttendanceSessionResponse,
    dependencies=[
        Depends(require_permission("attendance.punch"))
    ],
)
async def punch_out(
    request: Request,
    service: AttendanceService = Depends(
        get_attendance_service
    ),
    current_user=Depends(get_current_user),
):
    ip_address = request.client.host if request.client else None

    return await service.punch_out(
        user_id=current_user.id,
        ip_address=ip_address,
    )


@router.get(
    "/my",
    response_model=list[AttendanceResponse],
    dependencies=[
        Depends(require_permission("attendance.view"))
    ],
)
async def get_my_attendance(
    service: AttendanceService = Depends(
        get_attendance_service
    ),
    current_user=Depends(get_current_user),
):
    return await service.get_user_attendance(
        user_id=current_user.id,
        company_id=current_user.company_id,
    )


@router.get(
    "",
    response_model=AttendanceListResponse,
    dependencies=[
        Depends(require_permission("attendance.manage"))
    ],
)
async def get_attendance(
    user_id: int | None = Query(
        default=None,
        ge=1,
    ),
    date_from: date | None = Query(
        default=None,
    ),
    date_to: date | None = Query(
        default=None,
    ),
    status: int | None = Query(
        default=None,
    ),
    search: str | None = Query(
        default=None,
        min_length=1,
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
    service: AttendanceService = Depends(
        get_attendance_service
    ),
    current_user=Depends(get_current_user),
):
    return await service.get_attendance(
        company_id=current_user.company_id,
        user_id=user_id,
        date_from=date_from,
        date_to=date_to,
        status=status,
        search=search,
        page=page,
        page_size=page_size,
    )


@router.get(
    "/{attendance_id}/sessions",
    response_model=list[AttendanceSessionResponse],
    dependencies=[
        Depends(require_permission("attendance.view"))
    ],
)
async def get_attendance_sessions(
    attendance_id: int,
    service: AttendanceService = Depends(
        get_attendance_service
    ),
    current_user=Depends(get_current_user),
):
    return await service.get_sessions(
        attendance_id=attendance_id,
        company_id=current_user.company_id,
    )

@router.get(
    "/users/{user_id}",
    response_model=list[AttendanceResponse],
    dependencies=[
        Depends(require_permission("attendance.manage"))
    ],
)
async def get_user_attendance(
    user_id: int,
    service: AttendanceService = Depends(
        get_attendance_service
    ),
    current_user=Depends(get_current_user),
):
    return await service.get_user_attendance(
        user_id=user_id,
        company_id=current_user.company_id,
    )

@router.patch(
    "/{attendance_id}",
    response_model=AttendanceResponse,
    dependencies=[
        Depends(require_permission("attendance.manage"))
    ],
)
async def update_attendance(
    attendance_id: int,
    data: AttendanceUpdate,
    service: AttendanceService = Depends(
        get_attendance_service
    ),
    current_user=Depends(get_current_user),
):
    return await service.update_attendance(
        attendance_id=attendance_id,
        status=data.status,
        remarks=data.remarks,
        company_id=current_user.company_id,
    )