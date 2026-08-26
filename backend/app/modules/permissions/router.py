from fastapi import APIRouter, Depends, Query, status

from app.modules.permissions.dependencies import (
    get_permission_service,
    require_permission,
)
from app.modules.permissions.schema import (
    PermissionCreate,
    PermissionListResponse,
    PermissionResponse,
    PermissionUpdate,
)
from app.modules.permissions.service import PermissionService

router = APIRouter(
    prefix="/permissions",
    tags=["Permissions"],
)

@router.post(
    "/",
    response_model=PermissionResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[
        Depends(require_permission("permissions.create"))
    ]
)
async def create_permission(
    data: PermissionCreate,
    service: PermissionService = Depends(
        get_permission_service
    )
):
    return await service.create_permission(data)

@router.patch(
    "/{permission_id}",
    response_model=PermissionResponse,
    dependencies=[
        Depends(require_permission("permissions.update"))
    ]
)
async def update_permission(
    permission_id: int,
    data: PermissionUpdate,
    service: PermissionService = Depends(get_permission_service)
):

    return await service.update_permission(
        permission_id=permission_id,
        data=data
    )

@router.get(
    "/{permission_id}",
    response_model=PermissionResponse,
    dependencies=[
        Depends(require_permission("permissions.view"))
    ]
)
async def get_permission(
    permission_id: int,
    service: PermissionService = Depends(get_permission_service)
):
    return await service.get_permission(permission_id)

@router.get(
    "/",
    response_model=PermissionListResponse,
    dependencies=[
        Depends(require_permission("permissions.view"))
    ]
)
async def list_permissions(
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
    service: PermissionService = Depends(
        get_permission_service
    )
):
    return await service.get_permissions(
        search=search,
        page=page,
        page_size=page_size,
    )

@router.delete(
    "/{permission_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_permission("permissions.delete"))]
)
async def delete_permission(
    permission_id: int,
    service: PermissionService = Depends(get_permission_service)
):
    await service.delete_permission(permission_id)