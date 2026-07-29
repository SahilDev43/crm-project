from fastapi import Depends

from app.common.dependencies import get_db

from app.modules.users.repository import UserRepository

from app.modules.auth.service import AuthService


def get_auth_service(
    db=Depends(get_db),
):
    repo = UserRepository(db)
    return AuthService(repo)