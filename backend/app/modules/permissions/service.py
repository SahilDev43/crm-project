from app.modules.permissions.repository import PermissionRepository
from app.modules.users.repository import UserRepository

class PermissionService:
    """Service for permission-related business logic."""

    def __init__(self, permission_repo: PermissionRepository, user_repo: UserRepository):

        self.permission_repo = permission_repo
        self.user_repo = user_repo

    async def has_permission(
            self,
            user_id: int,
            permission: str
    ) -> bool:

        """Check whether a user has a specific permission"""

        user = await self.user_repo.get_by_id(user_id)

        if not user:
            return False

        if not user.role_id:
            return False

        permission = await self.permission_repo.get_by_role_id(
            user.role_id
        )

        permission_names = {
            p.name for p in permission
        }

        return permission in permission_names