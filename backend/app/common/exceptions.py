from fastapi import status


class AppException(Exception):
    """Base application exception. Subclasses set status_code/detail."""

    status_code: int = status.HTTP_400_BAD_REQUEST
    detail: str = "Application error"

    def __init__(self, detail: str | None = None):
        if detail is not None:
            self.detail = detail
        super().__init__(self.detail)


class UserAlreadyExistsError(AppException):
    """Raised when creating a user with an existing email."""

    status_code = status.HTTP_409_CONFLICT
    detail = "Email already exists"


class UserNotFoundError(AppException):
    """Raised when a user cannot be found."""

    status_code = status.HTTP_404_NOT_FOUND
    detail = "User not found"

class InvalidCredentialsError(AppException):
    """Raised when a Invalid Credintials."""

    status_code = status.HTTP_401_UNAUTHORIZED
    detail = "Invalid email or password"

class InvalidTokenError(AppException):
    """ Raised when a invalid authentication token found. """

    status_code = status.HTTP_401_UNAUTHORIZED
    detail="Invalid authentication token"

class UserNotAuthenticatedError(AppException):
    status_code=status.HTTP_401_UNAUTHORIZED
    detail="Authentication required"

class PermissionDeniedError(AppException):
    """Raised when a user doesn't have the required permission."""

    status_code = status.HTTP_403_FORBIDDEN
    detail = "You don't have permission to perform this action"

class RoleAlreadyExistsError(AppException):
    """Raised when creating a role with an existing name."""

    status_code = status.HTTP_409_CONFLICT
    detail = "Role already exists"

class RoleNotFoundError(AppException):
    """Raised when a role cannot be found."""

    status_code = status.HTTP_404_NOT_FOUND
    detail = "Role not found"

class PermissionNotFoundError(AppException):
    """Raised when a permission cannot be found."""

    status_code = status.HTTP_404_NOT_FOUND
    detail = "Permission not found"


class RolePermissionAlreadyExistsError(AppException):
    """Raised when permission is already assigned to the role."""

    status_code = status.HTTP_409_CONFLICT
    detail = "Permission already assigned to this role"


class RolePermissionNotFoundError(AppException):
    """Raised when permission is not assigned to the role."""

    status_code = status.HTTP_404_NOT_FOUND
    detail = "Permission is not assigned to this role"