from datetime import date

from sqlalchemy import Numeric, String, case, cast, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.constants.attendance import AttendanceReport
from app.common.constants.invoice import InvoiceStatus
from app.common.constants.payroll import PayrollStatus
from app.db.base_repository import BaseRepository
from app.modules.attendance.model import Attendance
from app.modules.attendance.session_model import AttendanceSession
from app.modules.deal_statuses.model import DealStatus
from app.modules.deals.model import Deal
from app.modules.invoices.model import Invoice
from app.modules.invoices.payment_model import InvoicePayment
from app.modules.leads.model import Lead, LeadStatus
from app.modules.payroll.model import Payroll
from app.modules.users.model import User


# Deal.budget is a free-text field, not a numeric column. Only sum the
# values that actually look like plain numbers instead of guessing at
# ranges/currency strings, so totals never include fabricated amounts.
_NUMERIC_BUDGET = case(
    (
        Deal.budget.op("~")(r"^\s*[0-9]+(\.[0-9]+)?\s*$"),
        cast(func.trim(Deal.budget), Numeric(15, 2)),
    ),
    else_=0,
)

_DEAL_OWNER = func.coalesce(Deal.assigned_to, Deal.created_by)


def _user_name(first_name_col, last_name_col):
    return func.trim(func.concat(first_name_col, " ", last_name_col))


class ReportRepository(BaseRepository):

    def __init__(self, db: AsyncSession):
        super().__init__(db)

    # -------------------------------------------------------------
    # Sales / Leads / Deals
    # -------------------------------------------------------------

    async def get_lead_totals(
        self,
        company_id: int,
        date_from: date,
        date_to: date,
        user_id: int | None = None,
    ) -> dict:

        filters = [
            Lead.company_id == company_id,
            Lead.is_deleted.is_(False),
            func.date(Lead.created_at).between(date_from, date_to),
        ]

        query = (
            select(
                func.count(Lead.id),
                func.count(Lead.id).filter(LeadStatus.code == "new"),
                func.count(Lead.id).filter(Lead.is_converted.is_(True)),
                func.count(Lead.id).filter(LeadStatus.code == "rejected"),
            )
            .select_from(Lead)
            .outerjoin(LeadStatus, Lead.status_id == LeadStatus.id)
        )

        if user_id is not None:
            query = query.join(Deal, Deal.lead_id == Lead.id).where(
                or_(Deal.assigned_to == user_id, Deal.created_by == user_id)
            )

        result = await self.db.execute(query.where(*filters))
        total, new, converted, lost = result.one()

        return {
            "total_leads": total,
            "new_leads": new,
            "converted_leads": converted,
            "lost_leads": lost,
        }

    async def get_deal_totals(
        self,
        company_id: int,
        date_from: date,
        date_to: date,
        user_id: int | None = None,
    ) -> dict:

        filters = [
            Deal.company_id == company_id,
            func.date(Deal.created_at).between(date_from, date_to),
        ]

        if user_id is not None:
            filters.append(_DEAL_OWNER == user_id)

        result = await self.db.execute(
            select(
                func.count(Deal.id),
                func.count(Deal.id).filter(DealStatus.code == "won"),
                func.count(Deal.id).filter(DealStatus.code == "lost"),
            )
            .select_from(Deal)
            .join(DealStatus, Deal.deal_status_id == DealStatus.id)
            .where(*filters)
        )

        total, won, lost = result.one()

        return {
            "total_deals": total,
            "active_deals": total - won - lost,
            "won_deals": won,
            "lost_deals": lost,
        }

    async def get_lead_status_breakdown(
        self,
        company_id: int,
        date_from: date,
        date_to: date,
        user_id: int | None = None,
    ) -> list[tuple]:

        filters = [
            Lead.company_id == company_id,
            Lead.is_deleted.is_(False),
            func.date(Lead.created_at).between(date_from, date_to),
        ]

        query = (
            select(
                LeadStatus.id,
                LeadStatus.name,
                func.count(Lead.id),
            )
            .select_from(Lead)
            .join(LeadStatus, Lead.status_id == LeadStatus.id)
        )

        if user_id is not None:
            query = query.join(Deal, Deal.lead_id == Lead.id).where(
                or_(Deal.assigned_to == user_id, Deal.created_by == user_id)
            )

        query = query.where(*filters).group_by(
            LeadStatus.id, LeadStatus.name
        ).order_by(LeadStatus.id)

        result = await self.db.execute(query)
        return result.all()

    async def get_lead_source_breakdown(
        self,
        company_id: int,
        date_from: date,
        date_to: date,
        user_id: int | None = None,
    ) -> list[tuple]:

        source_expr = func.coalesce(
            func.nullif(func.trim(Lead.source), ""), "Unknown"
        )

        filters = [
            Lead.company_id == company_id,
            Lead.is_deleted.is_(False),
            func.date(Lead.created_at).between(date_from, date_to),
        ]

        query = select(source_expr.label("source"), func.count(Lead.id)).select_from(
            Lead
        )

        if user_id is not None:
            query = query.join(Deal, Deal.lead_id == Lead.id).where(
                or_(Deal.assigned_to == user_id, Deal.created_by == user_id)
            )

        query = (
            query.where(*filters)
            .group_by(source_expr)
            .order_by(func.count(Lead.id).desc())
        )

        result = await self.db.execute(query)
        return result.all()

    async def get_deal_pipeline(
        self,
        company_id: int,
        date_from: date,
        date_to: date,
        user_id: int | None = None,
    ) -> list[tuple]:

        filters = [
            Deal.company_id == company_id,
            func.date(Deal.created_at).between(date_from, date_to),
        ]

        if user_id is not None:
            filters.append(_DEAL_OWNER == user_id)

        result = await self.db.execute(
            select(
                DealStatus.id,
                DealStatus.name,
                func.count(Deal.id),
                func.coalesce(func.sum(_NUMERIC_BUDGET), 0),
            )
            .select_from(Deal)
            .join(DealStatus, Deal.deal_status_id == DealStatus.id)
            .where(*filters)
            .group_by(DealStatus.id, DealStatus.name)
            .order_by(DealStatus.id)
        )
        return result.all()

    async def get_deal_performance(
        self,
        company_id: int,
        date_from: date,
        date_to: date,
        page: int,
        page_size: int,
        user_id: int | None = None,
    ) -> tuple[list[tuple], int]:

        filters = [
            Deal.company_id == company_id,
            func.date(Deal.created_at).between(date_from, date_to),
        ]

        if user_id is not None:
            filters.append(_DEAL_OWNER == user_id)

        total_result = await self.db.execute(
            select(func.count(func.distinct(_DEAL_OWNER)))
            .select_from(Deal)
            .join(DealStatus, Deal.deal_status_id == DealStatus.id)
            .where(*filters)
        )
        total = total_result.scalar_one()

        result = await self.db.execute(
            select(
                User.id,
                _user_name(User.first_name, User.last_name),
                func.count(Deal.id),
                func.count(Deal.id).filter(DealStatus.code == "won"),
                func.count(Deal.id).filter(DealStatus.code == "lost"),
            )
            .select_from(Deal)
            .join(DealStatus, Deal.deal_status_id == DealStatus.id)
            .join(User, User.id == _DEAL_OWNER)
            .where(*filters)
            .group_by(User.id, User.first_name, User.last_name)
            .order_by(func.count(Deal.id).desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )

        return result.all(), total

    # -------------------------------------------------------------
    # Revenue
    # -------------------------------------------------------------

    def _paid_subquery(self):
        return (
            select(
                InvoicePayment.invoice_id.label("invoice_id"),
                func.sum(InvoicePayment.amount).label("paid"),
            )
            .group_by(InvoicePayment.invoice_id)
            .subquery()
        )

    async def get_revenue_totals(
        self,
        company_id: int,
        date_from: date,
        date_to: date,
        user_id: int | None = None,
    ) -> dict:

        paid_sq = self._paid_subquery()
        balance_expr = Invoice.grand_total - func.coalesce(paid_sq.c.paid, 0)

        filters = [
            Invoice.company_id == company_id,
            Invoice.is_deleted.is_(False),
            Invoice.status != InvoiceStatus.CANCELLED,
            Invoice.invoice_date >= date_from,
            Invoice.invoice_date <= date_to,
        ]

        query = (
            select(
                func.count(Invoice.id),
                func.coalesce(func.sum(Invoice.grand_total), 0),
                func.coalesce(func.sum(func.coalesce(paid_sq.c.paid, 0)), 0),
                func.coalesce(func.sum(balance_expr), 0),
                func.coalesce(
                    func.sum(balance_expr).filter(
                        Invoice.due_date.is_not(None),
                        Invoice.due_date < date.today(),
                        Invoice.status != InvoiceStatus.PAID,
                    ),
                    0,
                ),
            )
            .select_from(Invoice)
            .outerjoin(paid_sq, paid_sq.c.invoice_id == Invoice.id)
        )

        if user_id is not None:
            query = query.join(Deal, Invoice.deal_id == Deal.id).where(
                or_(Deal.assigned_to == user_id, Deal.created_by == user_id)
            )

        result = await self.db.execute(query.where(*filters))

        invoice_count, invoiced, paid, outstanding, overdue = result.one()

        return {
            "invoice_count": invoice_count,
            "total_invoiced": invoiced,
            "total_paid": paid,
            "total_outstanding": outstanding,
            "total_overdue": overdue,
        }

    async def get_revenue_trend(
        self,
        company_id: int,
        date_from: date,
        date_to: date,
    ) -> list[tuple]:

        paid_sq = self._paid_subquery()
        balance_expr = Invoice.grand_total - func.coalesce(paid_sq.c.paid, 0)
        period = func.to_char(
            func.date_trunc("month", Invoice.invoice_date), "YYYY-MM"
        )

        filters = [
            Invoice.company_id == company_id,
            Invoice.is_deleted.is_(False),
            Invoice.status != InvoiceStatus.CANCELLED,
            Invoice.invoice_date >= date_from,
            Invoice.invoice_date <= date_to,
        ]

        result = await self.db.execute(
            select(
                period.label("period"),
                func.coalesce(func.sum(Invoice.grand_total), 0),
                func.coalesce(func.sum(func.coalesce(paid_sq.c.paid, 0)), 0),
                func.coalesce(func.sum(balance_expr), 0),
            )
            .select_from(Invoice)
            .outerjoin(paid_sq, paid_sq.c.invoice_id == Invoice.id)
            .where(*filters)
            .group_by(period)
            .order_by(period)
        )

        return result.all()

    async def get_invoice_status_breakdown(
        self,
        company_id: int,
        date_from: date,
        date_to: date,
    ) -> list[tuple]:

        label = case(
            *[(Invoice.status == code, name) for code, name in InvoiceStatus.LABELS.items()],
            else_=cast(Invoice.status, String),
        )

        filters = [
            Invoice.company_id == company_id,
            Invoice.is_deleted.is_(False),
            Invoice.invoice_date >= date_from,
            Invoice.invoice_date <= date_to,
        ]

        result = await self.db.execute(
            select(
                label.label("status"),
                func.count(Invoice.id),
                func.coalesce(func.sum(Invoice.grand_total), 0),
            )
            .select_from(Invoice)
            .where(*filters)
            .group_by(label, Invoice.status)
            .order_by(Invoice.status)
        )

        return result.all()

    # -------------------------------------------------------------
    # Attendance
    # -------------------------------------------------------------

    def _first_punch_subquery(self):
        return (
            select(
                AttendanceSession.attendance_id.label("attendance_id"),
                func.min(AttendanceSession.punch_in_at).label("first_punch_in"),
            )
            .where(AttendanceSession.is_deleted.is_(False))
            .group_by(AttendanceSession.attendance_id)
            .subquery()
        )

    async def get_attendance_totals(
        self,
        company_id: int,
        date_from: date,
        date_to: date,
        user_id: int | None = None,
    ) -> dict:

        first_punch = self._first_punch_subquery()
        late_expr = (
            func.extract("hour", first_punch.c.first_punch_in)
            >= AttendanceReport.LATE_THRESHOLD_HOUR
        )

        filters = [
            Attendance.company_id == company_id,
            Attendance.is_deleted.is_(False),
            Attendance.attendance_date >= date_from,
            Attendance.attendance_date <= date_to,
        ]

        if user_id is not None:
            filters.append(Attendance.user_id == user_id)

        result = await self.db.execute(
            select(
                func.count(Attendance.id).filter(Attendance.total_time > 0),
                func.count(Attendance.id).filter(late_expr),
                func.coalesce(func.sum(Attendance.total_time), 0),
            )
            .select_from(Attendance)
            .outerjoin(first_punch, first_punch.c.attendance_id == Attendance.id)
            .where(*filters)
        )

        present_days, late_days, total_working_time = result.one()

        return {
            "present_days": present_days,
            "late_days": late_days,
            "total_working_time": total_working_time,
        }

    async def get_attendance_by_user(
        self,
        company_id: int,
        date_from: date,
        date_to: date,
        page: int,
        page_size: int,
    ) -> tuple[list[tuple], int]:

        first_punch = self._first_punch_subquery()
        late_expr = (
            func.extract("hour", first_punch.c.first_punch_in)
            >= AttendanceReport.LATE_THRESHOLD_HOUR
        )

        filters = [
            Attendance.company_id == company_id,
            Attendance.is_deleted.is_(False),
            Attendance.attendance_date >= date_from,
            Attendance.attendance_date <= date_to,
        ]

        total_result = await self.db.execute(
            select(func.count(func.distinct(User.id)))
            .select_from(Attendance)
            .join(User, User.id == Attendance.user_id)
            .where(*filters)
        )
        total = total_result.scalar_one()

        result = await self.db.execute(
            select(
                User.id,
                _user_name(User.first_name, User.last_name),
                func.count(Attendance.id).filter(Attendance.total_time > 0),
                func.count(Attendance.id).filter(late_expr),
                func.coalesce(func.sum(Attendance.total_time), 0),
            )
            .select_from(Attendance)
            .join(User, User.id == Attendance.user_id)
            .outerjoin(first_punch, first_punch.c.attendance_id == Attendance.id)
            .where(*filters)
            .group_by(User.id, User.first_name, User.last_name)
            .order_by(User.first_name)
            .offset((page - 1) * page_size)
            .limit(page_size)
        )

        return result.all(), total

    async def count_active_employees(self, company_id: int) -> int:
        result = await self.db.execute(
            select(func.count(User.id)).where(
                User.company_id == company_id,
                User.is_deleted.is_(False),
                User.is_active.is_(True),
            )
        )
        return result.scalar_one()

    async def get_today_attendance_snapshot(self, company_id: int) -> dict:

        today = date.today()

        result = await self.db.execute(
            select(
                func.count(Attendance.id).filter(Attendance.total_time > 0),
                func.count(
                    func.distinct(AttendanceSession.user_id)
                ).filter(
                    AttendanceSession.punch_out_at.is_(None),
                    AttendanceSession.is_deleted.is_(False),
                ),
            )
            .select_from(Attendance)
            .outerjoin(
                AttendanceSession,
                AttendanceSession.attendance_id == Attendance.id,
            )
            .where(
                Attendance.company_id == company_id,
                Attendance.is_deleted.is_(False),
                Attendance.attendance_date == today,
            )
        )

        present_today, currently_working = result.one()
        return {
            "present_today": present_today,
            "currently_working": currently_working,
        }

    async def get_my_attendance_today(self, user_id: int) -> dict:

        today = date.today()

        attendance_result = await self.db.execute(
            select(Attendance.total_time).where(
                Attendance.user_id == user_id,
                Attendance.attendance_date == today,
                Attendance.is_deleted.is_(False),
            )
        )
        row = attendance_result.first()
        total_time = row[0] if row else 0

        session_result = await self.db.execute(
            select(func.count(AttendanceSession.id)).where(
                AttendanceSession.user_id == user_id,
                AttendanceSession.punch_out_at.is_(None),
                AttendanceSession.is_deleted.is_(False),
            )
        )
        currently_working = session_result.scalar_one() > 0

        return {
            "present": row is not None and total_time > 0,
            "currently_working": currently_working,
            "total_time_minutes": total_time,
        }

    # -------------------------------------------------------------
    # Payroll
    # -------------------------------------------------------------

    async def get_payroll_totals(
        self,
        company_id: int,
        month: int,
        year: int,
        user_id: int | None = None,
    ) -> dict:

        filters = [
            Payroll.company_id == company_id,
            Payroll.is_deleted.is_(False),
            Payroll.payroll_month == month,
            Payroll.payroll_year == year,
        ]

        if user_id is not None:
            filters.append(Payroll.user_id == user_id)

        result = await self.db.execute(
            select(
                func.count(Payroll.id),
                func.coalesce(func.sum(Payroll.gross_salary), 0),
                func.coalesce(func.sum(Payroll.total_deductions), 0),
                func.coalesce(func.sum(Payroll.net_salary), 0),
                func.count(Payroll.id).filter(Payroll.status == PayrollStatus.PAID),
                func.count(Payroll.id).filter(
                    Payroll.status.in_(
                        [PayrollStatus.DRAFT, PayrollStatus.PROCESSED]
                    )
                ),
            )
            .select_from(Payroll)
            .where(*filters)
        )

        total, gross, deductions, net, paid, pending = result.one()

        return {
            "total_payroll": total,
            "total_gross_salary": gross,
            "total_deductions": deductions,
            "total_net_salary": net,
            "paid_payroll": paid,
            "pending_payroll": pending,
        }

    async def get_payroll_by_employee(
        self,
        company_id: int,
        month: int,
        year: int,
        page: int,
        page_size: int,
        user_id: int | None = None,
    ) -> tuple[list[tuple], int]:

        filters = [
            Payroll.company_id == company_id,
            Payroll.is_deleted.is_(False),
            Payroll.payroll_month == month,
            Payroll.payroll_year == year,
        ]

        if user_id is not None:
            filters.append(Payroll.user_id == user_id)

        total_result = await self.db.execute(
            select(func.count(Payroll.id)).select_from(Payroll).where(*filters)
        )
        total = total_result.scalar_one()

        status_label = case(
            (Payroll.status == PayrollStatus.DRAFT, "Draft"),
            (Payroll.status == PayrollStatus.PROCESSED, "Processed"),
            (Payroll.status == PayrollStatus.PAID, "Paid"),
            (Payroll.status == PayrollStatus.CANCELLED, "Cancelled"),
            else_=cast(Payroll.status, String),
        )

        result = await self.db.execute(
            select(
                User.id,
                _user_name(User.first_name, User.last_name),
                Payroll.gross_salary,
                Payroll.total_deductions,
                Payroll.net_salary,
                status_label,
            )
            .select_from(Payroll)
            .join(User, User.id == Payroll.user_id)
            .where(*filters)
            .order_by(User.first_name)
            .offset((page - 1) * page_size)
            .limit(page_size)
        )

        return result.all(), total

    # -------------------------------------------------------------
    # Performance
    # -------------------------------------------------------------

    async def get_performance(
        self,
        company_id: int,
        date_from: date,
        date_to: date,
        page: int,
        page_size: int,
        sort_by: str,
        user_id: int | None = None,
    ) -> tuple[list[tuple], int]:

        deal_filters = [
            Deal.company_id == company_id,
            func.date(Deal.created_at).between(date_from, date_to),
        ]

        deals_sq = (
            select(
                _DEAL_OWNER.label("user_id"),
                func.count(Deal.id).label("deals_count"),
                func.count(Deal.id).filter(DealStatus.code == "won").label(
                    "won_deals"
                ),
            )
            .select_from(Deal)
            .join(DealStatus, Deal.deal_status_id == DealStatus.id)
            .where(*deal_filters)
            .group_by(_DEAL_OWNER)
            .subquery()
        )

        leads_sq = (
            select(
                _DEAL_OWNER.label("user_id"),
                func.count(func.distinct(Lead.id)).label("leads_count"),
            )
            .select_from(Deal)
            .join(Lead, Deal.lead_id == Lead.id)
            .where(*deal_filters)
            .group_by(_DEAL_OWNER)
            .subquery()
        )

        invoice_filters = [
            Invoice.company_id == company_id,
            Invoice.is_deleted.is_(False),
            Invoice.status != InvoiceStatus.CANCELLED,
            Invoice.invoice_date >= date_from,
            Invoice.invoice_date <= date_to,
        ]

        invoices_sq = (
            select(
                Deal.created_by.label("user_id"),
                func.count(Invoice.id).label("invoices_count"),
                func.coalesce(func.sum(Invoice.grand_total), 0).label(
                    "revenue_generated"
                ),
            )
            .select_from(Invoice)
            .join(Deal, Invoice.deal_id == Deal.id)
            .where(*invoice_filters)
            .group_by(Deal.created_by)
            .subquery()
        )

        base_filters = [
            User.company_id == company_id,
            User.is_deleted.is_(False),
        ]

        if user_id is not None:
            base_filters.append(User.id == user_id)

        sort_columns = {
            "leads": deals_sq.c.deals_count,
            "deals": deals_sq.c.deals_count,
            "won_deals": deals_sq.c.won_deals,
            "win_rate": deals_sq.c.won_deals,
        }
        order_col = sort_columns.get(sort_by, deals_sq.c.deals_count)

        total_result = await self.db.execute(
            select(func.count(User.id)).where(*base_filters)
        )
        total = total_result.scalar_one()

        result = await self.db.execute(
            select(
                User.id,
                _user_name(User.first_name, User.last_name),
                func.coalesce(leads_sq.c.leads_count, 0),
                func.coalesce(deals_sq.c.deals_count, 0),
                func.coalesce(deals_sq.c.won_deals, 0),
                func.coalesce(invoices_sq.c.invoices_count, 0),
                func.coalesce(invoices_sq.c.revenue_generated, 0),
            )
            .select_from(User)
            .outerjoin(deals_sq, deals_sq.c.user_id == User.id)
            .outerjoin(leads_sq, leads_sq.c.user_id == User.id)
            .outerjoin(invoices_sq, invoices_sq.c.user_id == User.id)
            .where(*base_filters)
            .order_by(func.coalesce(order_col, 0).desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )

        return result.all(), total
