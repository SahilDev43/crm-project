from fastapi import APIRouter, Depends, status

from app.modules.users.dependencies import get_user_service
from app.modules.users.schema import(
    UserCreate,
    UserResponse
)

from app.modules.users.service import UserService

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(data: UserCreate, service: UserService = Depends(get_user_service)):
    return await service.create_user(data)

@router.get("/", response_model=list[UserResponse])
async def list_users(
    service: UserService = Depends(get_user_service)
):
    return await service.get_users()

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: int, service: UserService = Depends(get_user_service)):
    return await service.get_user(user_id)
