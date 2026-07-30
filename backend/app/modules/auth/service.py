from app.core.jwt import (
    create_access_token,
    create_refresh_token,
    decode_token
)

from app.core.security import verify_password

from app.common.exceptions import InvalidCredentialsError, InvalidTokenError

from app.modules.users.repository import UserRepository

from jose import JWTError


class AuthService:

    def __init__(self, repo: UserRepository):
        self.repo = repo

    async def login(self, email: str, password: str):
        user = await self.repo.get_by_email(email)

        if not user:
            raise InvalidCredentialsError()

        if not verify_password(password, user.password_hash):
            raise InvalidCredentialsError()

        access_token = create_access_token(
            {
                "sub": str(user.id),
                "email": user.email,
            }
        )

        refresh_token = create_refresh_token(
            {
                "sub": str(user.id),
                "email": user.email,
            }
        )

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
        }

    async def me(self, current_user):
        return current_user

    async def refresh(self, refresh_token: str):

        try:

            payload = decode_token(refresh_token)

            if payload.get("type") != "refresh":
                raise InvalidTokenError()

        except JWTError:
            raise InvalidTokenError()

        return {
            "access_token": create_access_token(
                {
                    "sub": payload["sub"],
                    "email": payload["email"]
                }
            ),
            "token_type": "bearer"
        }

    async def logout(self):
        return {
            "message": "Logged out successfully"
        }