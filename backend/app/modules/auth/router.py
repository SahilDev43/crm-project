from fastapi import APIRouter, Depends

from app.modules.auth.schema import (
    LoginRequest,
    TokenResponse,
    AccessTokenResponse,
    RefreshTokenRequest,
    MeResponse,
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

@router.get("/me", response_model=MeResponse)
async def me(current_user: CurrentUser):
    permissions: list[str] = []

    if current_user.role:
        permissions = sorted(
            {
                rp.permission.name
                for rp in current_user.role.role_permissions
            }
        )

    data = MeResponse.model_validate(current_user)
    data.permissions = permissions

    return data

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