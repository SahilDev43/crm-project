from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
from app.core.config import settings

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