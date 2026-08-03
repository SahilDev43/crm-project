from fastapi import APIRouter, Depends, status

from app.modules.permissions.dependencies import require_permission
from app.modules.role_permissions.dependencies import (
    get_role_permission_service,
)
from app.modules.role_permissions.schema import (
    RolePermissionResponse,
)
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
    )