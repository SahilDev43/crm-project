from typing import TYPE_CHECKING
from sqlalchemy import Boolean, String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.db.mixins import SoftDeleteMixin, TimestampMixin
from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship
if TYPE_CHECKING:
    from app.modules.companies.model import Company

class User(Base, TimestampMixin, SoftDeleteMixin):

    __tablename__ = "users"

    id:Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    first_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    last_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    email: Mapped[str] = mapped_column(
        String(100),
        unique= True,
        index=True,
        nullable=False
    )

    phone: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True,
    )

    password_hash: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    role_id : Mapped[int | None] = mapped_column(
        ForeignKey("roles.id"),
        nullable=True
    )

    company_id: Mapped[int | None] = mapped_column(
        ForeignKey(
            "companies.id",
            ondelete="RESTRICT"
        ),
        nullable=False,
        index=True
    )

    role = relationship(
        "Role",
        back_populates="users"
    )

    company: Mapped["Company | None"] = relationship(
        "Company",
        back_populates="users",
    )

    profile_image: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    is_verified: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    def __repr__(self) -> str:
        return f"<User(id={self.id}, email='{self.email}')>"