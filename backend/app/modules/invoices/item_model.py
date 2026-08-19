from decimal import Decimal

from sqlalchemy import ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class InvoiceItem(Base):
    __tablename__ = "invoice_items"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    invoice_id: Mapped[int] = mapped_column(
        ForeignKey("invoices.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    description: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    quantity: Mapped[Decimal] = mapped_column(
        Numeric(15, 3),
        nullable=False,
        default=1,
    )

    unit_price: Mapped[Decimal] = mapped_column(
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
    gst_rate: Mapped[Decimal] = mapped_column(
        Numeric(5, 2),
        nullable=False,
        default=0,
    )

    cgst_rate: Mapped[Decimal] = mapped_column(
        Numeric(5, 2),
        nullable=False,
        default=0,
    )

    cgst_amount: Mapped[Decimal] = mapped_column(
        Numeric(15, 2),
        nullable=False,
        default=0,
    )

    sgst_rate: Mapped[Decimal] = mapped_column(
        Numeric(5, 2),
        nullable=False,
        default=0,
    )

    sgst_amount: Mapped[Decimal] = mapped_column(
        Numeric(15, 2),
        nullable=False,
        default=0,
    )

    igst_rate: Mapped[Decimal] = mapped_column(
        Numeric(5, 2),
        nullable=False,
        default=0,
    )

    igst_amount: Mapped[Decimal] = mapped_column(
        Numeric(15, 2),
        nullable=False,
        default=0,
    )

    total: Mapped[Decimal] = mapped_column(
        Numeric(15, 2),
        nullable=False,
        default=0,
    )

    invoice = relationship(
        "Invoice",
        back_populates="items",
    )