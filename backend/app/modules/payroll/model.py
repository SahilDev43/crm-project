from datetime import date
from decimal import Decimal

from sqlalchemy import(
    Boolean,
    Date,
    ForeignKey,
    Index,
    Integer,
    Numeric,
    Text
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
from sqlalchemy import UniqueConstraint
from app.db.mixins import TimestampMixin, SoftDeleteMixin

class Payroll(Base, TimestampMixin, SoftDeleteMixin):

    __tablename__ = "payrolls"

    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "payroll_month",
            "payroll_year",
            name="uq_payroll_user_period",
        ),
        Index(
            "ix_payrolls_company_period",
            "company_id",
            "payroll_year",
            "payroll_month",
        ),
    )

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    company_id: Mapped[int] = mapped_column(
        ForeignKey(
            "companies.id",
            ondelete="RESTRICT"
        ),
        nullable=False,
        index=True
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey(
         "users.id",
         ondelete="RESTRICT"   
        ),
        nullable=False,
        index=True
    )

    payroll_month: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )

    payroll_year: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )

    basic_salary: Mapped[int] = mapped_column(
        Numeric(15, 2),
        nullable=False
    )

    gross_salary: Mapped[int] = mapped_column(
        Numeric(15, 2),
        nullable=False
    )

    total_deductions: Mapped[Decimal] = mapped_column(
        Numeric(15, 2),
        nullable=False,
        default=0,
        server_default="0"
    )

    net_salary: Mapped[Decimal] = mapped_column(
        Numeric(15, 2),
        nullable=False
    )

    status: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=1,
        server_default="1"
    )

    paid_at: Mapped[date | None] = mapped_column(
        Date,
        nullable=True
    )

    remarks: Mapped[str] = mapped_column(
        Text,
        nullable=True
    )

    company = relationship(
        "Company"
    )

    user = relationship(
        "User"
    )

    items = relationship(
        "PayrollItem",
        back_populates="payroll",
        cascade="all, delete-orphan"
    )
