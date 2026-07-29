from app.core.jwt import (
    create_access_token,
    create_refresh_token,
)

from app.core.security import verify_password

from app.common.exceptions import InvalidCredentialsError

from app.modules.users.repository import UserRepository


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