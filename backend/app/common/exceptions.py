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