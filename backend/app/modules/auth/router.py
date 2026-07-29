from fastapi import APIRouter, Depends

from app.modules.auth.schema import (
    LoginRequest,
    TokenResponse,
)

from app.modules.auth.dependencies import (
    get_auth_service,
)

from app.modules.auth.service import AuthService

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