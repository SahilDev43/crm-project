import csv
import io
import math
from datetime import date

from app.common.exceptions import InvalidDateRangeError, InvalidReportFilterError
from app.modules.reports.repository import ReportRepository
from app.modules.users.model import User
from app.modules.users.repository import UserRepository


def _first_day_of_month(d: date) -> date:
    return d.replace(day=1)


def _safe_rate(numerator: int, denominator: int) -> float:
    if not denominator:
        return 0.0
    return round((numerator / denominator) * 100, 2)


def _paginate(items: list, total: int, page: int, page_size: int) -> dict:
    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": math.ceil(total / page_size) if total else 0,
    }


class ReportService:

    def __init__(
        self,
        repo: ReportRepository,
        user_repo: UserRepository,
    ):
        self.repo = repo
        self.user_repo = user_repo

    # -------------------------------------------------------------
    # Shared validation / scoping helpers
    # -------------------------------------------------------------

    @staticmethod
    def has_permission(user: User, permission: str) -> bool:
        if not user.role:
            return False
        return permission in {
            rp.permission.name for rp in user.role.role_permissions
        }

    @staticmethod
    def resolve_date_range(
        date_from: date | None,
        date_to: date | None,
    ) -> tuple[date, date]:

        today = date.today()

        if date_from is None and date_to is None:
            return _first_day_of_month(today), today

        if date_from is None:
            date_from = _first_day_of_month(date_to)

        if date_to is None:
            date_to = today

        if date_from > date_to:
            raise InvalidDateRangeError()

        return date_from, date_to

    @staticmethod
    def resolve_month_year(
        month: int | None,
        year: int | None,
    ) -> tuple[int, int]:

        today = date.today()
        month = month if month is not None else today.month
        year = year if year is not None else today.year

        if not (1 <= month <= 12):
            raise InvalidReportFilterError("month must be between 1 and 12")

        if not (2000 <= year <= 2100):
            raise InvalidReportFilterError("year is out of range")

        return month, year

    async def _resolve_user_filter(
        self,
        current_user: User,
        user_id: int | None,
    ) -> int:
        """Validate an explicit user_id filter belongs to the caller's
        company. Used on endpoints already gated by a company-wide
        permission, where a specific-employee lookup is legitimate."""

        if user_id is None:
            return None

        target = await self.user_repo.get_by_id(user_id)

        if not target or target.is_deleted or target.company_id != current_user.company_id:
            raise InvalidReportFilterError("user_id does not belong to your company")

        return user_id

    async def _resolve_scope(
        self,
        current_user: User,
        scope_permission: str,
        user_id: int | None,
    ) -> int | None:
        """For endpoints where a base permission (reports.view) lets
        everyone in, but a category permission (reports.sales, ...)
        unlocks company-wide visibility. Without that permission the
        caller is always scoped to themselves, and any user_id they
        send is ignored."""

        if not self.has_permission(current_user, scope_permission):
            return current_user.id

        return await self._resolve_user_filter(current_user, user_id)

    # -------------------------------------------------------------
    # Summary
    # -------------------------------------------------------------

    async def get_summary(self, current_user: User) -> dict:

        company_id = current_user.company_id
        summary: dict = {}

        today = date.today()
        month_start = _first_day_of_month(today)

        if self.has_permission(current_user, "reports.sales"):
            leads = await self.repo.get_lead_totals(company_id, month_start, today)
            deals = await self.repo.get_deal_totals(company_id, month_start, today)
            summary["total_leads"] = leads["total_leads"]
            summary["total_deals"] = deals["total_deals"]
            summary["won_deals"] = deals["won_deals"]
            summary["lost_deals"] = deals["lost_deals"]
        else:
            leads = await self.repo.get_lead_totals(
                company_id, month_start, today, user_id=current_user.id
            )
            deals = await self.repo.get_deal_totals(
                company_id, month_start, today, user_id=current_user.id
            )
            summary["my_leads"] = leads["total_leads"]
            summary["my_active_deals"] = deals["active_deals"]
            summary["my_won_deals"] = deals["won_deals"]

        if self.has_permission(current_user, "reports.revenue"):
            revenue = await self.repo.get_revenue_totals(company_id, month_start, today)
            summary["total_invoices"] = revenue["invoice_count"]
            summary["total_invoiced_amount"] = revenue["total_invoiced"]
            summary["total_paid_amount"] = revenue["total_paid"]
            summary["total_outstanding_amount"] = revenue["total_outstanding"]
        elif not self.has_permission(current_user, "reports.sales"):
            my_revenue = await self.repo.get_revenue_totals(
                company_id, month_start, today, user_id=current_user.id
            )
            summary["my_invoices"] = my_revenue["invoice_count"]
            summary["my_outstanding_amount"] = my_revenue["total_outstanding"]

        if self.has_permission(current_user, "reports.attendance"):
            employees = await self.repo.count_active_employees(company_id)
            snapshot = await self.repo.get_today_attendance_snapshot(company_id)
            summary["total_employees"] = employees
            summary["present_today"] = snapshot["present_today"]
            summary["absent_today"] = max(employees - snapshot["present_today"], 0)
            summary["currently_working"] = snapshot["currently_working"]

            if self.has_permission(current_user, "attendance.manage"):
                attendance_totals = await self.repo.get_attendance_totals(
                    company_id, today, today
                )
                summary["late_today"] = attendance_totals["late_days"]
                summary["attendance_percentage"] = _safe_rate(
                    snapshot["present_today"], employees
                )
        else:
            summary["my_attendance_today"] = await self.repo.get_my_attendance_today(
                current_user.id
            )

        return summary

    # -------------------------------------------------------------
    # Sales
    # -------------------------------------------------------------

    async def get_sales_report(
        self,
        current_user: User,
        date_from: date | None,
        date_to: date | None,
        user_id: int | None,
    ) -> dict:

        date_from, date_to = self.resolve_date_range(date_from, date_to)
        scope_user_id = await self._resolve_scope(current_user, "reports.sales", user_id)
        company_id = current_user.company_id

        leads = await self.repo.get_lead_totals(company_id, date_from, date_to, scope_user_id)
        deals = await self.repo.get_deal_totals(company_id, date_from, date_to, scope_user_id)

        return {
            **leads,
            **deals,
            "conversion_rate": _safe_rate(
                leads["converted_leads"], leads["total_leads"]
            ),
        }

    async def get_lead_status_report(
        self,
        current_user: User,
        date_from: date | None,
        date_to: date | None,
        user_id: int | None,
    ) -> list[dict]:

        date_from, date_to = self.resolve_date_range(date_from, date_to)
        scope_user_id = await self._resolve_scope(current_user, "reports.sales", user_id)

        rows = await self.repo.get_lead_status_breakdown(
            current_user.company_id, date_from, date_to, scope_user_id
        )
        return [
            {"status_id": r[0], "status_name": r[1], "count": r[2]} for r in rows
        ]

    async def get_lead_source_report(
        self,
        current_user: User,
        date_from: date | None,
        date_to: date | None,
        user_id: int | None,
    ) -> list[dict]:

        date_from, date_to = self.resolve_date_range(date_from, date_to)
        scope_user_id = await self._resolve_scope(current_user, "reports.sales", user_id)

        rows = await self.repo.get_lead_source_breakdown(
            current_user.company_id, date_from, date_to, scope_user_id
        )
        return [{"source": r[0], "count": r[1]} for r in rows]

    async def get_deal_pipeline_report(
        self,
        current_user: User,
        date_from: date | None,
        date_to: date | None,
        user_id: int | None,
    ) -> list[dict]:

        date_from, date_to = self.resolve_date_range(date_from, date_to)
        scope_user_id = await self._resolve_scope(current_user, "reports.sales", user_id)

        rows = await self.repo.get_deal_pipeline(
            current_user.company_id, date_from, date_to, scope_user_id
        )
        return [
            {
                "status_id": r[0],
                "status_name": r[1],
                "count": r[2],
                "total_value": r[3],
            }
            for r in rows
        ]

    async def get_deal_performance_report(
        self,
        current_user: User,
        date_from: date | None,
        date_to: date | None,
        user_id: int | None,
        page: int,
        page_size: int,
    ) -> dict:

        date_from, date_to = self.resolve_date_range(date_from, date_to)
        validated_user_id = await self._resolve_user_filter(current_user, user_id)

        rows, total = await self.repo.get_deal_performance(
            current_user.company_id,
            date_from,
            date_to,
            page,
            page_size,
            validated_user_id,
        )

        items = [
            {
                "user_id": r[0],
                "user_name": r[1],
                "total_deals": r[2],
                "won_deals": r[3],
                "lost_deals": r[4],
                "win_rate": _safe_rate(r[3], r[2]),
            }
            for r in rows
        ]

        return _paginate(items, total, page, page_size)

    # -------------------------------------------------------------
    # Revenue
    # -------------------------------------------------------------

    async def get_revenue_report(
        self,
        current_user: User,
        date_from: date | None,
        date_to: date | None,
    ) -> dict:

        date_from, date_to = self.resolve_date_range(date_from, date_to)
        return await self.repo.get_revenue_totals(
            current_user.company_id, date_from, date_to
        )

    async def get_revenue_trend_report(
        self,
        current_user: User,
        date_from: date | None,
        date_to: date | None,
    ) -> list[dict]:

        date_from, date_to = self.resolve_date_range(date_from, date_to)
        rows = await self.repo.get_revenue_trend(
            current_user.company_id, date_from, date_to
        )
        return [
            {
                "period": r[0],
                "invoiced_amount": r[1],
                "paid_amount": r[2],
                "outstanding_amount": r[3],
            }
            for r in rows
        ]

    async def get_invoice_status_report(
        self,
        current_user: User,
        date_from: date | None,
        date_to: date | None,
    ) -> list[dict]:

        date_from, date_to = self.resolve_date_range(date_from, date_to)
        rows = await self.repo.get_invoice_status_breakdown(
            current_user.company_id, date_from, date_to
        )
        return [
            {"status": r[0], "count": r[1], "total_amount": r[2]} for r in rows
        ]

    # -------------------------------------------------------------
    # Attendance
    # -------------------------------------------------------------

    async def get_attendance_report(
        self,
        current_user: User,
        date_from: date | None,
        date_to: date | None,
        user_id: int | None,
    ) -> dict:

        date_from, date_to = self.resolve_date_range(date_from, date_to)
        scope_user_id = await self._resolve_scope(
            current_user, "reports.attendance", user_id
        )

        totals = await self.repo.get_attendance_totals(
            current_user.company_id, date_from, date_to, scope_user_id
        )

        calendar_days = (date_to - date_from).days + 1

        if scope_user_id is not None:
            employee_multiplier = 1
        else:
            employee_multiplier = await self.repo.count_active_employees(
                current_user.company_id
            )

        total_days = calendar_days * max(employee_multiplier, 1)
        present_days = totals["present_days"]
        average_working_time = (
            round(totals["total_working_time"] / present_days, 2)
            if present_days
            else 0.0
        )

        return {
            "total_days": total_days,
            "present_days": present_days,
            "absent_days": max(total_days - present_days, 0),
            "late_days": totals["late_days"],
            "total_working_time": totals["total_working_time"],
            "average_working_time": average_working_time,
        }

    async def get_attendance_user_report(
        self,
        current_user: User,
        date_from: date | None,
        date_to: date | None,
        page: int,
        page_size: int,
    ) -> dict:

        date_from, date_to = self.resolve_date_range(date_from, date_to)
        rows, total = await self.repo.get_attendance_by_user(
            current_user.company_id, date_from, date_to, page, page_size
        )

        calendar_days = (date_to - date_from).days + 1

        items = []
        for r in rows:
            present_days = r[2]
            total_working_time = r[4]
            items.append(
                {
                    "user_id": r[0],
                    "user_name": r[1],
                    "present_days": present_days,
                    "absent_days": max(calendar_days - present_days, 0),
                    "late_days": r[3],
                    "total_working_time": total_working_time,
                    "average_working_time": round(
                        total_working_time / present_days, 2
                    )
                    if present_days
                    else 0.0,
                }
            )

        return _paginate(items, total, page, page_size)

    # -------------------------------------------------------------
    # Payroll
    # -------------------------------------------------------------

    async def get_payroll_report(
        self,
        current_user: User,
        month: int | None,
        year: int | None,
        user_id: int | None,
    ) -> dict:

        month, year = self.resolve_month_year(month, year)
        validated_user_id = await self._resolve_user_filter(current_user, user_id)

        return await self.repo.get_payroll_totals(
            current_user.company_id, month, year, validated_user_id
        )

    async def get_payroll_employee_report(
        self,
        current_user: User,
        month: int | None,
        year: int | None,
        page: int,
        page_size: int,
        user_id: int | None,
    ) -> dict:

        month, year = self.resolve_month_year(month, year)
        validated_user_id = await self._resolve_user_filter(current_user, user_id)

        rows, total = await self.repo.get_payroll_by_employee(
            current_user.company_id,
            month,
            year,
            page,
            page_size,
            validated_user_id,
        )

        items = [
            {
                "user_id": r[0],
                "user_name": r[1],
                "gross_salary": r[2],
                "deductions": r[3],
                "net_salary": r[4],
                "status": r[5],
            }
            for r in rows
        ]

        return _paginate(items, total, page, page_size)

    # -------------------------------------------------------------
    # Performance
    # -------------------------------------------------------------

    async def get_performance_report(
        self,
        current_user: User,
        date_from: date | None,
        date_to: date | None,
        page: int,
        page_size: int,
        sort_by: str,
        user_id: int | None,
    ) -> dict:

        date_from, date_to = self.resolve_date_range(date_from, date_to)
        validated_user_id = await self._resolve_user_filter(current_user, user_id)

        rows, total = await self.repo.get_performance(
            current_user.company_id,
            date_from,
            date_to,
            page,
            page_size,
            sort_by,
            validated_user_id,
        )

        items = [
            {
                "user_id": r[0],
                "user_name": r[1],
                "leads_count": r[2],
                "deals_count": r[3],
                "won_deals": r[4],
                "win_rate": _safe_rate(r[4], r[3]),
                "invoices_count": r[5],
                "revenue_generated": r[6],
            }
            for r in rows
        ]

        if sort_by == "win_rate":
            items.sort(key=lambda i: i["win_rate"], reverse=True)

        return _paginate(items, total, page, page_size)

    # -------------------------------------------------------------
    # Export
    # -------------------------------------------------------------

    EXPORT_TYPES = {
        "sales",
        "leads-status",
        "leads-sources",
        "deals-pipeline",
        "deals-performance",
        "revenue",
        "revenue-trend",
        "invoices-status",
        "attendance",
        "attendance-users",
        "payroll",
        "payroll-employees",
        "performance",
    }

    REQUIRED_PERMISSION = {
        "sales": "reports.view",
        "leads-status": "reports.view",
        "leads-sources": "reports.view",
        "deals-pipeline": "reports.view",
        "deals-performance": "reports.performance",
        "revenue": "reports.revenue",
        "revenue-trend": "reports.revenue",
        "invoices-status": "reports.revenue",
        "attendance": "reports.view",
        "attendance-users": "reports.attendance",
        "payroll": "reports.payroll",
        "payroll-employees": "reports.payroll",
        "performance": "reports.performance",
    }

    async def export_csv(
        self,
        current_user: User,
        report_type: str,
        date_from: date | None,
        date_to: date | None,
        month: int | None,
        year: int | None,
        user_id: int | None,
    ) -> tuple[str, list[dict]]:

        if report_type not in self.EXPORT_TYPES:
            raise InvalidReportFilterError("Unsupported report_type")

        if not self.has_permission(
            current_user, self.REQUIRED_PERMISSION[report_type]
        ):
            from app.common.exceptions import PermissionDeniedError

            raise PermissionDeniedError()

        if report_type == "sales":
            data = [await self.get_sales_report(current_user, date_from, date_to, user_id)]
        elif report_type == "leads-status":
            data = await self.get_lead_status_report(current_user, date_from, date_to, user_id)
        elif report_type == "leads-sources":
            data = await self.get_lead_source_report(current_user, date_from, date_to, user_id)
        elif report_type == "deals-pipeline":
            data = await self.get_deal_pipeline_report(current_user, date_from, date_to, user_id)
        elif report_type == "deals-performance":
            result = await self.get_deal_performance_report(
                current_user, date_from, date_to, user_id, page=1, page_size=1000
            )
            data = result["items"]
        elif report_type == "revenue":
            data = [await self.get_revenue_report(current_user, date_from, date_to)]
        elif report_type == "revenue-trend":
            data = await self.get_revenue_trend_report(current_user, date_from, date_to)
        elif report_type == "invoices-status":
            data = await self.get_invoice_status_report(current_user, date_from, date_to)
        elif report_type == "attendance":
            data = [await self.get_attendance_report(current_user, date_from, date_to, user_id)]
        elif report_type == "attendance-users":
            result = await self.get_attendance_user_report(
                current_user, date_from, date_to, page=1, page_size=1000
            )
            data = result["items"]
        elif report_type == "payroll":
            data = [await self.get_payroll_report(current_user, month, year, user_id)]
        elif report_type == "payroll-employees":
            result = await self.get_payroll_employee_report(
                current_user, month, year, page=1, page_size=1000, user_id=user_id
            )
            data = result["items"]
        else:  # performance
            result = await self.get_performance_report(
                current_user,
                date_from,
                date_to,
                page=1,
                page_size=1000,
                sort_by="deals",
                user_id=user_id,
            )
            data = result["items"]

        return report_type, data

    @staticmethod
    def rows_to_csv(rows: list[dict]) -> str:

        buffer = io.StringIO()

        if not rows:
            return ""

        writer = csv.DictWriter(buffer, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)

        return buffer.getvalue()
