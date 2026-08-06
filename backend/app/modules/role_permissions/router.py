from fastapi import APIRouter, Depends, status

from app.modules.permissions.dependencies import require_permission
from app.modules.role_permissions.dependencies import (
    get_role_permission_service,
)
from app.modules.permissions.schema import PermissionResponse
from app.modules.role_permissions.schema import RolePermissionResponse
from app.modules.role_permissions.service import (
    RolePermissionService,
)

router = APIRouter(
    prefix="/roles",
    tags=["Role Permissions"],
)

@router.post(
    "/{role_id}/permissions/{permission_id}",
    response_model=RolePermissionResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[
        Depends(require_permission("permissions.assign"))
    ],
)

async def assign_permission(
    role_id: int,
    permission_id: int,
    service: RolePermissionService = Depends(
        get_role_permission_service
    )
):

    return await service.assign_permission(
        role_id=role_id,
        permission_id=permission_id
    )

@router.delete(
    "/{role_id}/permissions/{permission_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[
        Depends(require_permission("permissions.assign"))
    ],
)

async def remove_permission(
    role_id: int,
    permission_id: int,
    service: RolePermissionService = Depends(
        get_role_permission_service
    )
):

    await service.remove_permission(
        role_id=role_id,
        permission_id=permission_id
    )

@router.get(
    "/{role_id}/permissions",
    response_model=list[PermissionResponse],
    dependencies=[
        Depends(require_permission("permissions.view"))
    ],
)
async def get_role_permissions(
    role_id: int,
    service: RolePermissionService = Depends(
        get_role_permission_service
    ),
):
    return await service.get_role_permissions(role_id)