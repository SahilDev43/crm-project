from datetime import date
from decimal import Decimal

from sqlalchemy import (
    Boolean,
    Date,
    ForeignKey,
    Integer,
    Numeric,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from sqlalchemy import Index
from app.db.mixins import TimestampMixin, SoftDeleteMixin


class EmployeeSalary(
    Base,
    TimestampMixin,
    SoftDeleteMixin,
):
    __tablename__ = "employee_salaries"

    __table_args__ = (
        Index(
            "ix_employee_salary_user_effective",
            "user_id",
            "effective_from",
        ),
    )

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey(
            "users.id",
            ondelete="RESTRICT",
        ),
        nullable=False,
        index=True,
    )

    salary_structure_id: Mapped[int] = mapped_column(
        ForeignKey(
            "salary_structures.id",
            ondelete="RESTRICT",
        ),
        nullable=False,
        index=True,
    )

    effective_from: Mapped[date] = mapped_column(
        Date,
        nullable=False,
        index=True,
    )

    effective_to: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
        index=True,
    )

    basic_salary: Mapped[Decimal] = mapped_column(
        Numeric(15, 2),
        nullable=False,
    )

    gross_salary: Mapped[Decimal | None] = mapped_column(
        Numeric(15, 2),
        nullable=True,
    )

    status: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=1,
        server_default="1",
    )

    remarks: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    user = relationship(
        "User",
    )

    salary_structure = relationship(
        "SalaryStructure",
    )