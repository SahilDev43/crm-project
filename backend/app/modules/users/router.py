from fastapi import APIRouter, Depends, status

from app.modules.users.dependencies import get_user_service
from app.modules.users.schema import(
    UserCreate,
    UserResponse,
    UserUpdate
)

from app.modules.users.service import UserService
from app.core.jwt import get_current_user
from app.modules.permissions.dependencies import require_permission

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_permission("users.create"))])
async def create_user(data: UserCreate, service: UserService = Depends(get_user_service)):
    return await service.create_user(data)

@router.patch(
    "/{user_id}",
    response_model=UserResponse,
    dependencies=[
        Depends(require_permission("users.update"))
    ],
)
async def update_user(
    user_id: int,
    data: UserUpdate,
    service: UserService = Depends(get_user_service),
):
    return await service.update_user(
        user_id=user_id,
        data=data,
    )

@router.get("/", response_model=list[UserResponse], dependencies=[Depends(require_permission("users.view"))])
async def list_users(
    service: UserService = Depends(get_user_service)
):
    return await service.get_users()

@router.get("/{user_id}", response_model=UserResponse, dependencies=[Depends(require_permission("users.view"))])
async def get_user(user_id: int, service: UserService = Depends(get_user_service)):
    return await service.get_user(user_id)

@router.delete(
    "/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[
        Depends(require_permission("users.delete"))
    ]
)
async def delete_user(
    user_id: int,
    service: UserService = Depends(get_user_service)
):
    await service.delete_user(user_id)