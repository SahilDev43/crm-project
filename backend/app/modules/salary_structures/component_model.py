from decimal import Decimal

from sqlalchemy import Boolean, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship


from app.db.base import Base
from app.db.mixins import TimestampMixin, SoftDeleteMixin
from sqlalchemy import UniqueConstraint

class SalaryStructureComponent(
    Base,
    TimestampMixin,
    SoftDeleteMixin,
):
    __tablename__ = "salary_structure_components"

    __table_args__ = (
        UniqueConstraint(
            "salary_structure_id",
            "salary_component_id",
            name="uq_salary_structure_component",
        ),
    )

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    salary_structure_id: Mapped[int] = mapped_column(
        ForeignKey(
            "salary_structures.id",
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

    calculation_type: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    calculation_base: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True
    )

    calculation_base_component_id: Mapped[int | None] = mapped_column(
        ForeignKey(
            "salary_components.id",
            ondelete="RESTRICT",
        ),
        nullable=True,
        index=True,
    )

    value: Mapped[Decimal] = mapped_column(
        Numeric(15, 2),
        nullable=False,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
        server_default="true",
    )

    salary_structure = relationship(
        "SalaryStructure",
        back_populates="components",
    )

    salary_component = relationship(
        "SalaryComponent",
        foreign_keys=[salary_component_id],
    )