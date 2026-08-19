from datetime import date
from decimal import Decimal

from sqlalchemy import Date, ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class InvoicePayment(Base):
    __tablename__ = "invoice_payments"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    invoice_id: Mapped[int] = mapped_column(
        ForeignKey("invoices.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    payment_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
    )

    amount: Mapped[Decimal] = mapped_column(
        Numeric(15, 2),
        nullable=False,
    )

    payment_method: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    transaction_reference: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    remarks: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    invoice = relationship(
        "Invoice",
        back_populates="payments",
    )