from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import (
    Date,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.db.mixins import TimestampMixin, SoftDeleteMixin


class Invoice(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "invoices"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    company_id: Mapped[int] = mapped_column(
        ForeignKey("companies.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )

    deal_id: Mapped[int] = mapped_column(
        ForeignKey("deals.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )

    # Invoice information
    invoice_number: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        unique=True,
        index=True,
    )

    invoice_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
        index=True,
    )

    due_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )

    # Company billing snapshot
    company_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    company_address: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    company_state: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    company_state_code: Mapped[str | None] = mapped_column(
        String(10),
        nullable=True,
    )

    company_gstin: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True,
    )

    # Customer billing snapshot
    customer_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    customer_company: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    customer_email: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    customer_phone: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    customer_address: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    customer_state: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    customer_state_code: Mapped[str | None] = mapped_column(
        String(10),
        nullable=True,
    )

    customer_gstin: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True,
    )

    # Amounts
    subtotal: Mapped[Decimal] = mapped_column(
        Numeric(15, 2),
        nullable=False,
        default=0,
    )

    discount: Mapped[Decimal] = mapped_column(
        Numeric(15, 2),
        nullable=False,
        default=0,
    )

    taxable_amount: Mapped[Decimal] = mapped_column(
        Numeric(15, 2),
        nullable=False,
        default=0,
    )

    # GST
    cgst_amount: Mapped[Decimal] = mapped_column(
        Numeric(15, 2),
        nullable=False,
        default=0,
    )

    sgst_amount: Mapped[Decimal] = mapped_column(
        Numeric(15, 2),
        nullable=False,
        default=0,
    )

    igst_amount: Mapped[Decimal] = mapped_column(
        Numeric(15, 2),
        nullable=False,
        default=0,
    )

    total_tax: Mapped[Decimal] = mapped_column(
        Numeric(15, 2),
        nullable=False,
        default=0,
    )

    grand_total: Mapped[Decimal] = mapped_column(
        Numeric(15, 2),
        nullable=False,
        default=0,
    )

    # Status
    status: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=1,
        index=True,
    )

    notes: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    # Relationships
    company = relationship("Company")

    deal = relationship("Deal")

    items = relationship(
        "InvoiceItem",
        back_populates="invoice",
        cascade="all, delete-orphan",
    )

    payments = relationship(
        "InvoicePayment",
        back_populates="invoice",
        cascade="all, delete-orphan",
    )