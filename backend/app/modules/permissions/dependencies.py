from fastapi import Depends

from app.common.dependencies import get_db
from app.common.exceptions import PermissionDeniedError
from app.core.jwt import get_current_user


def require_permission(permission: str):

    async def checker(
        current_user=Depends(get_current_user),
    ):

        if not current_user.role:
            raise PermissionDeniedError()

        permissions = {
            rp.permission.name
            for rp in current_user.role.role_permissions
        }

        if permission not in permissions:
            raise PermissionDeniedError()

        return current_user

    return checker