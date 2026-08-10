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

class PermissionAlreadyExistsError(AppException):
    """Raised when permission is already assigned to the role."""
    status_code = status.HTTP_409_CONFLICT
    detail = "Permission already exists"

class PermissionNotFoundError(AppException):
    """Raised when permission is Not Found."""
    status_code = status.HTTP_404_NOT_FOUND
    detail = "Permission not found"

class CompanyNotFoundError(AppException):
    """Raised when company is Not Found."""
    status_code = status.HTTP_404_NOT_FOUND
    detail = "Company not found"


class CompanyAlreadyExistsError(AppException):
    """Raised when compant already exists."""
    status_code = status.HTTP_409_CONFLICT
    detail = "Company already exists"

class CompanyInactiveError(AppException):
    """Raised when compant is inactive."""
    status_code = status.HTTP_400_BAD_REQUEST
    detail = "Company already exists"

class InvalidFileTypeError(AppException):
    """Raised when invalid file type."""
    status_code = status.HTTP_400_BAD_REQUEST
    detail = "Invalid file type"


class FileTooLargeError(AppException):
    """Raised when file is larger than 2mb."""
    status_code = status.HTTP_413_CONTENT_TOO_LARGE
    detail = "File size exceeds the maximum allowed size"

class LeadNotFoundError(AppException):
    """Raised when Lead is not found."""
    status_code = status.HTTP_404_NOT_FOUND
    detail = "Lead not found"


class LeadAlreadyExistsError(AppException):
    """Raised when Lead already exists."""
    status_code = status.HTTP_409_CONFLICT
    detail = "Lead already exists"


class LeadStatusNotFoundError(AppException):
    """Raised when Lead status is not found."""
    status_code = status.HTTP_404_NOT_FOUND
    detail = "Lead status not found"


class DefaultLeadStatusNotFoundError(AppException):
    """Raised when Lead status is not configured."""
    status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
    detail = "Default lead status not configured"

class CompanyApiKeyNotFoundError(AppException):
    """Raised when Lead status is not configured."""
    status_code = status.HTTP_404_NOT_FOUND
    detail = "Company API key not found"

class InvalidApiKeyError(AppException):
    """Raised when API Key shows Invalid"""
    status_code = status.HTTP_401_UNAUTHORIZED
    detail = "Invalid API Key"