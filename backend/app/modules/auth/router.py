from fastapi import APIRouter, Depends

from app.modules.auth.schema import (
    LoginRequest,
    TokenResponse,
    AccessTokenResponse,
    RefreshTokenRequest
    
)

from app.modules.auth.dependencies import (
    get_auth_service,
)

from app.modules.auth.service import AuthService
from app.core.jwt import get_current_user
from app.modules.users.model import User
from app.common.types import CurrentUser

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
    )

@router.post("/login", response_model=TokenResponse)
async def login(
    data: LoginRequest,
    service: AuthService = Depends(get_auth_service)
):

    return await service.login(
        data.email,
        data.password
    )

@router.get("/me")
async def me(current_user: CurrentUser):
    return current_user

@router.post("/refresh", response_model=AccessTokenResponse)

async def refresh(
    data: RefreshTokenRequest,
    service: AuthService = Depends(get_auth_service)
):
    return await service.refresh(data.refresh_token)

@router.post("/logout")
async def logout(
    current_user: CurrentUser,
    service: AuthService = Depends(get_auth_service)
):
    return await service.logout()