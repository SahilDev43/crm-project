from decimal import Decimal

from pydantic import BaseModel, ConfigDict


# ---------------------------------------------------------
# Summary (role-aware dashboard widget)
# ---------------------------------------------------------

class TodayAttendanceSummary(BaseModel):
    present: bool
    currently_working: bool
    total_time_minutes: int

    model_config = ConfigDict(from_attributes=True)


class ReportSummaryResponse(BaseModel):
    # Admin / company-wide
    total_leads: int | None = None
    total_deals: int | None = None
    won_deals: int | None = None
    lost_deals: int | None = None
    total_invoices: int | None = None
    total_invoiced_amount: Decimal | None = None
    total_paid_amount: Decimal | None = None
    total_outstanding_amount: Decimal | None = None
    total_employees: int | None = None
    present_today: int | None = None
    absent_today: int | None = None
    currently_working: int | None = None

    # HR
    late_today: int | None = None
    attendance_percentage: float | None = None

    # Normal user (self-scoped)
    my_leads: int | None = None
    my_active_deals: int | None = None
    my_won_deals: int | None = None
    my_invoices: int | None = None
    my_outstanding_amount: Decimal | None = None
    my_attendance_today: TodayAttendanceSummary | None = None


# ---------------------------------------------------------
# Sales
# ---------------------------------------------------------

class SalesReportResponse(BaseModel):
    total_leads: int
    new_leads: int
    converted_leads: int
    lost_leads: int
    total_deals: int
    active_deals: int
    won_deals: int
    lost_deals: int
    conversion_rate: float


class LeadStatusCount(BaseModel):
    status_id: int
    status_name: str
    count: int


class LeadSourceCount(BaseModel):
    source: str
    count: int


class DealPipelineItem(BaseModel):
    status_id: int
    status_name: str
    count: int
    total_value: Decimal


class DealPerformanceItem(BaseModel):
    user_id: int
    user_name: str
    total_deals: int
    won_deals: int
    lost_deals: int
    win_rate: float


class DealPerformanceListResponse(BaseModel):
    items: list[DealPerformanceItem]
    total: int
    page: int
    page_size: int
    total_pages: int


# ---------------------------------------------------------
# Revenue
# ---------------------------------------------------------

class RevenueReportResponse(BaseModel):
    total_invoiced: Decimal
    total_paid: Decimal
    total_outstanding: Decimal
    total_overdue: Decimal


class RevenueTrendPoint(BaseModel):
    period: str
    invoiced_amount: Decimal
    paid_amount: Decimal
    outstanding_amount: Decimal


class InvoiceStatusCount(BaseModel):
    status: str
    count: int
    total_amount: Decimal


# ---------------------------------------------------------
# Attendance
# ---------------------------------------------------------

class AttendanceReportResponse(BaseModel):
    total_days: int
    present_days: int
    absent_days: int
    late_days: int
    total_working_time: int
    average_working_time: float


class AttendanceUserItem(BaseModel):
    user_id: int
    user_name: str
    present_days: int
    absent_days: int
    late_days: int
    total_working_time: int
    average_working_time: float


class AttendanceUserListResponse(BaseModel):
    items: list[AttendanceUserItem]
    total: int
    page: int
    page_size: int
    total_pages: int


# ---------------------------------------------------------
# Payroll
# ---------------------------------------------------------

class PayrollReportResponse(BaseModel):
    total_payroll: int
    total_gross_salary: Decimal
    total_deductions: Decimal
    total_net_salary: Decimal
    paid_payroll: int
    pending_payroll: int


class PayrollEmployeeItem(BaseModel):
    user_id: int
    user_name: str
    gross_salary: Decimal
    deductions: Decimal
    net_salary: Decimal
    status: str


class PayrollEmployeeListResponse(BaseModel):
    items: list[PayrollEmployeeItem]
    total: int
    page: int
    page_size: int
    total_pages: int


# ---------------------------------------------------------
# Performance
# ---------------------------------------------------------

class PerformanceItem(BaseModel):
    user_id: int
    user_name: str
    leads_count: int
    deals_count: int
    won_deals: int
    win_rate: float
    invoices_count: int
    revenue_generated: Decimal


class PerformanceListResponse(BaseModel):
    items: list[PerformanceItem]
    total: int
    page: int
    page_size: int
    total_pages: int
