from fastapi import APIRouter, Depends, status

from app.modules.permissions.dependencies import require_permission
from app.modules.roles.dependencies import get_role_service
from app.modules.roles.schema import RoleCreate, RoleResponse, RoleUpdate
from app.modules.roles.service import RoleService


router = APIRouter(
    prefix="/roles",
    tags=["Roles"],
)


@router.post(
    "/",
    response_model=RoleResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[
        Depends(require_permission("roles.create"))
    ],
)
async def create_role(
    data: RoleCreate,
    service: RoleService = Depends(get_role_service),
):
    return await service.create_role(data)

@router.patch(
    "/{role_id}",
    response_model=RoleResponse,
    dependencies=[
        Depends(require_permission("roles.update"))
    ],
)
async def update_role(
    role_id: int,
    data: RoleUpdate,
    service: RoleService = Depends(get_role_service),
):
    return await service.update_role(
        role_id=role_id,
        data=data,
    )

@router.get(
    "/",
    response_model=list[RoleResponse],
    dependencies=[
        Depends(require_permission("roles.view"))
    ],
)
async def list_roles(
    service: RoleService = Depends(get_role_service),
):
    return await service.get_roles()


@router.get(
    "/{role_id}",
    response_model=RoleResponse,
    dependencies=[
        Depends(require_permission("roles.view"))
    ],
)
async def get_role(
    role_id: int,
    service: RoleService = Depends(get_role_service),
):
    return await service.get_role(role_id)

@router.delete(
    "/{role_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[
        Depends(require_permission("roles.delete"))
    ],
)

async def delete_role(
    role_id: int,
    service: RoleService = Depends(get_role_service)
):
    await service.delete_role(role_id)