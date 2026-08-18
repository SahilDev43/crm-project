from decimal import Decimal

from sqlalchemy import ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from sqlalchemy import UniqueConstraint
from app.db.mixins import TimestampMixin, SoftDeleteMixin


class PayrollItem(
    Base,
    TimestampMixin,
):
    __tablename__ = "payroll_items"

    __table_args__ = (
        UniqueConstraint(
            "payroll_id",
            "salary_component_id",
            name="uq_payroll_component",
        ),
    )

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    payroll_id: Mapped[int] = mapped_column(
        ForeignKey(
            "payrolls.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    salary_component_id: Mapped[int] = mapped_column(
        ForeignKey(
            "salary_components.id",
            ondelete="RESTRICT",
        ),
        nullable=False,
        index=True,
    )

    component_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    component_code: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    component_type: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    calculation_type: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    calculation_value: Mapped[Decimal] = mapped_column(
        Numeric(15, 2),
        nullable=False,
    )

    calculated_amount: Mapped[Decimal] = mapped_column(
        Numeric(15, 2),
        nullable=False,
    )

    payroll = relationship(
        "Payroll",
        back_populates="items",
    )

    salary_component = relationship(
        "SalaryComponent",
    )