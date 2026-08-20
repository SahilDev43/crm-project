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


class DealNotFoundError(AppException):
    """Raised when deal is not found."""
    status_code = status.HTTP_404_NOT_FOUND
    detail = "Deal not found"


class ProjectTypeNotFoundError(AppException):
    """Raised when project type is not found."""
    status_code = status.HTTP_404_NOT_FOUND
    detail = "Project type not found"


class DealPlatformNotFoundError(AppException):
    """Raised when deal platform is not found."""
    status_code = status.HTTP_404_NOT_FOUND
    detail = "Deal platform not found"


class DealStatusNotFoundError(AppException):
    """Raised when deal status is not found."""
    status_code = status.HTTP_404_NOT_FOUND
    detail = "Deal status not found"


class TeamNotFoundError(AppException):
    """Raised when team is not found."""
    status_code = status.HTTP_404_NOT_FOUND
    detail = "Team not found"


class AttendanceNotFoundError(AppException):
    """Raised when attendance record is not found."""
    status_code = status.HTTP_404_NOT_FOUND
    detail = "Attendance not found"


class AttendanceSessionActiveError(AppException):
    """Raised when punching in while a session is already active."""
    status_code = status.HTTP_409_CONFLICT
    detail = "You already have an active attendance session"


class AttendanceSessionNotActiveError(AppException):
    """Raised when punching out with no active session."""
    status_code = status.HTTP_400_BAD_REQUEST
    detail = "No active attendance session found"


class SalaryStructureNotFoundError(AppException):
    """Raised when salary structure is not found."""
    status_code = status.HTTP_404_NOT_FOUND
    detail = "Salary structure not found"


class SalaryStructureCodeExistsError(AppException):
    """Raised when salary structure code already exists."""
    status_code = status.HTTP_409_CONFLICT
    detail = "Salary structure code already exists"


class SalaryComponentCodeExistsError(AppException):
    """Raised when salary component code already exists."""
    status_code = status.HTTP_409_CONFLICT
    detail = "Salary component code already exists"


class SalaryStructureComponentExistsError(AppException):
    """Raised when salary component is already assigned to the structure."""
    status_code = status.HTTP_409_CONFLICT
    detail = "Salary component already exists in this structure"


class SalaryComponentNotFoundError(AppException):
    """Raised when salary component is not found."""
    status_code = status.HTTP_404_NOT_FOUND
    detail = "Salary component not found"


class InvalidCalculationTypeError(AppException):
    """Raised when calculation type is invalid."""
    status_code = status.HTTP_400_BAD_REQUEST
    detail = "Invalid calculation type"


class FixedComponentCalculationBaseError(AppException):
    """Raised when a fixed component has a calculation base."""
    status_code = status.HTTP_400_BAD_REQUEST
    detail = "Fixed components cannot have a calculation base"


class PercentageComponentCalculationBaseRequiredError(AppException):
    """Raised when a percentage component is missing a calculation base."""
    status_code = status.HTTP_400_BAD_REQUEST
    detail = "Percentage components require a calculation base"


class ComponentBaseRequiredError(AppException):
    """Raised when component-based calculation is missing a base component."""
    status_code = status.HTTP_400_BAD_REQUEST
    detail = "Component-based calculation requires a base component"


class ComponentBaseNotAllowedError(AppException):
    """Raised when a base component is set for a non component-based calculation."""
    status_code = status.HTTP_400_BAD_REQUEST
    detail = "Base component is only allowed for component-based calculations"


class NegativeComponentValueError(AppException):
    """Raised when a component value is negative."""
    status_code = status.HTTP_400_BAD_REQUEST
    detail = "Component value cannot be negative"


class SalaryStructureComponentNotFoundError(AppException):
    """Raised when salary structure component is not found."""
    status_code = status.HTTP_404_NOT_FOUND
    detail = "Salary structure component not found"


class EmployeeNotFoundError(AppException):
    """Raised when employee is not found."""
    status_code = status.HTTP_404_NOT_FOUND
    detail = "Employee not found"


class EmployeeInactiveError(AppException):
    """Raised when employee is inactive."""
    status_code = status.HTTP_400_BAD_REQUEST
    detail = "Employee is inactive"


class SalaryStructureInactiveError(AppException):
    """Raised when salary structure is inactive."""
    status_code = status.HTTP_400_BAD_REQUEST
    detail = "Salary structure is inactive"


class InvalidEffectiveDateRangeError(AppException):
    """Raised when effective_to is before effective_from."""
    status_code = status.HTTP_400_BAD_REQUEST
    detail = "effective_to cannot be before effective_from"


class SalaryPeriodOverlapError(AppException):
    """Raised when a salary period overlaps an existing record."""
    status_code = status.HTTP_409_CONFLICT
    detail = "Salary period overlaps with an existing salary record"


class EmployeeSalaryNotFoundError(AppException):
    """Raised when employee salary record is not found."""
    status_code = status.HTTP_404_NOT_FOUND
    detail = "Employee salary not found"

class PayrollAlreadyExistsError(AppException):
    """Raised when Payroll already exists"""
    status_code = status.HTTP_409_CONFLICT
    detail ="Payroll Already exists"


class InvalidCalculationBaseError(AppException):
    """Raised when calculation base is invalid."""
    status_code = status.HTTP_400_BAD_REQUEST
    detail = "Invalid calculation base"


class BaseComponentNotCalculatedError(AppException):
    """Raised when a base component has not been calculated yet."""
    status_code = status.HTTP_400_BAD_REQUEST
    detail = "Base component has not been calculated yet"


class InvalidComponentTypeError(AppException):
    """Raised when a salary component type is invalid."""
    status_code = status.HTTP_400_BAD_REQUEST
    detail = "Invalid component type"


class CircularSalaryComponentDependencyError(AppException):
    """Raised when salary components reference each other in a cycle."""
    status_code = status.HTTP_400_BAD_REQUEST
    detail = "Circular salary component dependency detected"


class GrossBasedCalculationNotSupportedError(AppException):
    """Raised when a gross-based component is calculated before gross salary is known."""
    status_code = status.HTTP_400_BAD_REQUEST
    detail = "Gross-based calculation is not supported during component calculation"


class SalaryStructureNoActiveComponentsError(AppException):
    """Raised when a salary structure has no active components to calculate."""
    status_code = status.HTTP_400_BAD_REQUEST
    detail = "Salary structure has no active components"

class PayrollNotFoundError(AppException):
    """Raised when a Payroll not found."""
    status_code = status.HTTP_404_NOT_FOUND
    detail = "Payroll not found"

class PayrollAlreadyPaidError(AppException):
    """Raised when marking a payroll as paid that is already paid."""
    status_code = status.HTTP_409_CONFLICT
    detail = "Payroll is already paid"

class CompanyBillingDetailsRequiredError(AppException):
    """Raised when company billing/state details are missing for an invoice."""
    status_code = status.HTTP_400_BAD_REQUEST
    detail  = "Company billing/state details are required for invoice generationn"

class InvoiceNotFoundError(AppException):
    """Raised when an invoice is not found."""
    status_code = status.HTTP_404_NOT_FOUND
    detail = "Invoice not found"

class PaymentExceedsInvoiceBalanceError(AppException):
    """Raised when a payment amount exceeds the invoice's remaining balance."""
    status_code = status.HTTP_400_BAD_REQUEST
    detail = "Payment amount exceeds the invoice's remaining balance"

class InvalidInvoiceStatusTransitionError(AppException):
    status_code = status.HTTP_400_BAD_REQUEST
    detail = "Invalid invoice status transition"

class InvoiceCannotBeCancelledError(AppException):
    status_code = status.HTTP_400_BAD_REQUEST
    detail = "Paid or cancelled invoices cannot be cancelled"