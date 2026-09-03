from datetime import date

from fastapi import APIRouter, Depends, Query, Response

from app.core.jwt import get_current_user
from app.modules.permissions.dependencies import require_permission
from app.modules.reports.dependencies import get_report_service
from app.modules.reports.schemas import (
    AttendanceReportResponse,
    AttendanceUserListResponse,
    DealPerformanceListResponse,
    DealPipelineItem,
    InvoiceStatusCount,
    LeadSourceCount,
    LeadStatusCount,
    PayrollEmployeeListResponse,
    PayrollReportResponse,
    PerformanceListResponse,
    ReportSummaryResponse,
    RevenueReportResponse,
    RevenueTrendPoint,
    SalesReportResponse,
)
from app.modules.reports.service import ReportService

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get(
    "/summary",
    response_model=ReportSummaryResponse,
    response_model_exclude_none=True,
    dependencies=[Depends(require_permission("reports.view"))],
)
async def get_summary(
    current_user=Depends(get_current_user),
    service: ReportService = Depends(get_report_service),
):
    return await service.get_summary(current_user)


@router.get(
    "/sales",
    response_model=SalesReportResponse,
    dependencies=[Depends(require_permission("reports.view"))],
)
async def get_sales_report(
    date_from: date | None = Query(default=None),
    date_to: date | None = Query(default=None),
    user_id: int | None = Query(default=None),
    current_user=Depends(get_current_user),
    service: ReportService = Depends(get_report_service),
):
    return await service.get_sales_report(current_user, date_from, date_to, user_id)


@router.get(
    "/leads/status",
    response_model=list[LeadStatusCount],
    dependencies=[Depends(require_permission("reports.view"))],
)
async def get_lead_status_report(
    date_from: date | None = Query(default=None),
    date_to: date | None = Query(default=None),
    user_id: int | None = Query(default=None),
    current_user=Depends(get_current_user),
    service: ReportService = Depends(get_report_service),
):
    return await service.get_lead_status_report(current_user, date_from, date_to, user_id)


@router.get(
    "/leads/sources",
    response_model=list[LeadSourceCount],
    dependencies=[Depends(require_permission("reports.view"))],
)
async def get_lead_source_report(
    date_from: date | None = Query(default=None),
    date_to: date | None = Query(default=None),
    user_id: int | None = Query(default=None),
    current_user=Depends(get_current_user),
    service: ReportService = Depends(get_report_service),
):
    return await service.get_lead_source_report(current_user, date_from, date_to, user_id)


@router.get(
    "/deals/pipeline",
    response_model=list[DealPipelineItem],
    dependencies=[Depends(require_permission("reports.view"))],
)
async def get_deal_pipeline_report(
    date_from: date | None = Query(default=None),
    date_to: date | None = Query(default=None),
    user_id: int | None = Query(default=None),
    current_user=Depends(get_current_user),
    service: ReportService = Depends(get_report_service),
):
    return await service.get_deal_pipeline_report(current_user, date_from, date_to, user_id)


@router.get(
    "/deals/performance",
    response_model=DealPerformanceListResponse,
    dependencies=[Depends(require_permission("reports.performance"))],
)
async def get_deal_performance_report(
    date_from: date | None = Query(default=None),
    date_to: date | None = Query(default=None),
    user_id: int | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=100),
    current_user=Depends(get_current_user),
    service: ReportService = Depends(get_report_service),
):
    return await service.get_deal_performance_report(
        current_user, date_from, date_to, user_id, page, page_size
    )


@router.get(
    "/revenue",
    response_model=RevenueReportResponse,
    dependencies=[Depends(require_permission("reports.revenue"))],
)
async def get_revenue_report(
    date_from: date | None = Query(default=None),
    date_to: date | None = Query(default=None),
    current_user=Depends(get_current_user),
    service: ReportService = Depends(get_report_service),
):
    return await service.get_revenue_report(current_user, date_from, date_to)


@router.get(
    "/revenue/trend",
    response_model=list[RevenueTrendPoint],
    dependencies=[Depends(require_permission("reports.revenue"))],
)
async def get_revenue_trend_report(
    date_from: date | None = Query(default=None),
    date_to: date | None = Query(default=None),
    current_user=Depends(get_current_user),
    service: ReportService = Depends(get_report_service),
):
    return await service.get_revenue_trend_report(current_user, date_from, date_to)


@router.get(
    "/invoices/status",
    response_model=list[InvoiceStatusCount],
    dependencies=[Depends(require_permission("reports.revenue"))],
)
async def get_invoice_status_report(
    date_from: date | None = Query(default=None),
    date_to: date | None = Query(default=None),
    current_user=Depends(get_current_user),
    service: ReportService = Depends(get_report_service),
):
    return await service.get_invoice_status_report(current_user, date_from, date_to)


@router.get(
    "/attendance",
    response_model=AttendanceReportResponse,
    dependencies=[Depends(require_permission("reports.view"))],
)
async def get_attendance_report(
    date_from: date | None = Query(default=None),
    date_to: date | None = Query(default=None),
    user_id: int | None = Query(default=None),
    current_user=Depends(get_current_user),
    service: ReportService = Depends(get_report_service),
):
    return await service.get_attendance_report(current_user, date_from, date_to, user_id)


@router.get(
    "/attendance/users",
    response_model=AttendanceUserListResponse,
    dependencies=[Depends(require_permission("reports.attendance"))],
)
async def get_attendance_user_report(
    date_from: date | None = Query(default=None),
    date_to: date | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=100),
    current_user=Depends(get_current_user),
    service: ReportService = Depends(get_report_service),
):
    return await service.get_attendance_user_report(
        current_user, date_from, date_to, page, page_size
    )


@router.get(
    "/payroll",
    response_model=PayrollReportResponse,
    dependencies=[Depends(require_permission("reports.payroll"))],
)
async def get_payroll_report(
    month: int | None = Query(default=None, ge=1, le=12),
    year: int | None = Query(default=None, ge=2000, le=2100),
    user_id: int | None = Query(default=None),
    current_user=Depends(get_current_user),
    service: ReportService = Depends(get_report_service),
):
    return await service.get_payroll_report(current_user, month, year, user_id)


@router.get(
    "/payroll/employees",
    response_model=PayrollEmployeeListResponse,
    dependencies=[Depends(require_permission("reports.payroll"))],
)
async def get_payroll_employee_report(
    month: int | None = Query(default=None, ge=1, le=12),
    year: int | None = Query(default=None, ge=2000, le=2100),
    user_id: int | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=100),
    current_user=Depends(get_current_user),
    service: ReportService = Depends(get_report_service),
):
    return await service.get_payroll_employee_report(
        current_user, month, year, page, page_size, user_id
    )


@router.get(
    "/performance",
    response_model=PerformanceListResponse,
    dependencies=[Depends(require_permission("reports.performance"))],
)
async def get_performance_report(
    date_from: date | None = Query(default=None),
    date_to: date | None = Query(default=None),
    user_id: int | None = Query(default=None),
    sort_by: str = Query(default="deals", pattern="^(leads|deals|won_deals|win_rate)$"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=100),
    current_user=Depends(get_current_user),
    service: ReportService = Depends(get_report_service),
):
    return await service.get_performance_report(
        current_user, date_from, date_to, page, page_size, sort_by, user_id
    )


@router.get(
    "/{report_type}/export",
    dependencies=[Depends(require_permission("reports.export"))],
)
async def export_report(
    report_type: str,
    date_from: date | None = Query(default=None),
    date_to: date | None = Query(default=None),
    month: int | None = Query(default=None, ge=1, le=12),
    year: int | None = Query(default=None, ge=2000, le=2100),
    user_id: int | None = Query(default=None),
    current_user=Depends(get_current_user),
    service: ReportService = Depends(get_report_service),
):
    resolved_type, rows = await service.export_csv(
        current_user, report_type, date_from, date_to, month, year, user_id
    )

    csv_content = service.rows_to_csv(rows)

    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={
            "Content-Disposition": f'attachment; filename="{resolved_type}.csv"'
        },
    )
