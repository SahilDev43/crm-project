from typing import TYPE_CHECKING
from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
from app.db.mixins import TimestampMixin, SoftDeleteMixin
from app.modules.leads.model import Lead, LeadStatus
if TYPE_CHECKING:
    from app.modules.users.model import User

class Company(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "companies"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        unique=True
    )

    logo: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True
    )

    company_address: Mapped[str | None] = mapped_column(
    Text,
    nullable=True,
    )

    gst_number: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True,
    )

    state: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    state_code: Mapped[str | None] = mapped_column(
        String(10),
        nullable=True,
    )

    is_active: Mapped[bool] = mapped_column(
        default=True,
        nullable=False
    )    

    #Relationship
    users: Mapped[list["User"]] = relationship(
        "User",
        back_populates="company",
    )

    leads: Mapped[list["Lead"]] = relationship(
        "Lead",
        back_populates="company",
    )

    api_keys: Mapped[list["CompanyApiKey"]] = relationship(
        "CompanyApiKey",
        back_populates="company",
        cascade="all, delete-orphan"
    )