from app.core.jwt import (
    create_access_token,
    create_refresh_token,
    decode_token
)

from app.core.security import verify_password

from app.common.exceptions import InvalidCredentialsError, InvalidTokenError, UserNotAuthenticatedError

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

        if not user.is_active:
            raise UserNotAuthenticatedError()

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

            user_id = payload.get("sub")

            if not user_id:
                raise InvalidTokenError()

        except JWTError:
            raise InvalidTokenError()

        user = await self.repo.get_by_id(int(user_id))

        if not user:
            raise InvalidTokenError()

        if not user.is_active:
            raise UserNotAuthenticatedError()

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