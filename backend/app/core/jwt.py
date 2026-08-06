from fastapi import Depends
from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
from app.core.config import settings
from app.common.exceptions import (
    InvalidTokenError,
    UserNotAuthenticatedError
)
from app.core.oauth2 import oauth2_scheme
from app.modules.users.dependencies import get_user_repository
from app.modules.users.repository import UserRepository

def create_access_token(data: dict) -> str:
    now = datetime.now(timezone.utc)
    to_encode = data.copy()

    expire = now + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )

    to_encode.update(
        {
            "iat": now,
            "exp": expire,
            "type": "access"
        }
    )

    return jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )

def create_refresh_token(data: dict) -> str:
    now = datetime.now(timezone.utc)
    to_encode = data.copy()

    expire = now + timedelta(
        days=settings.REFRESH_TOKEN_EXPIRE_DAYS
    )

    to_encode.update(
        {
            "iat": now,
            "exp": expire,
            "type": "refresh"
        }
    )

    return jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )

def decode_token(token: str) -> dict:
    return jwt.decode(
        token,
        settings.SECRET_KEY,
        algorithms=[settings.ALGORITHM]
    )

async def get_current_user(
        token: str = Depends(oauth2_scheme),
        repo: UserRepository = Depends(get_user_repository)
):
    try:

        payload = decode_token(token)

        if payload.get("type") != "access":
            raise InvalidTokenError()

        user_id = payload.get("sub")

        if not user_id:
            raise InvalidTokenError()

    except JWTError:
        raise InvalidTokenError()

    user = await repo.get_by_id(int(user_id))

    if not user:
        raise InvalidTokenError()

    if not user.is_active:
        raise UserNotAuthenticatedError()

    return user