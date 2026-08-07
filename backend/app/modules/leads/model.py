from sqlalchemy import (
    Boolean,
    ForeignKey,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.db.mixins import TimestampMixin, SoftDeleteMixin

class LeadStatus(Base, TimestampMixin):
    __tablename__ = "lead_statuses"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        unique=True,
    )

    code: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        unique=True,
        index=True,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    leads: Mapped[list["Lead"]] = relationship(
        "Lead",
        back_populates="status",
    )


class Lead(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "leads"

    __table_args__ = (
        UniqueConstraint(
            "company_id",
            "external_lead_id",
            name="uq_leads_company_external_lead_id",
        ),
    )

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    # ID coming from Laravel/source website
    external_lead_id: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    # RichestSoft / IndeedSEO / etc.
    company_id: Mapped[int] = mapped_column(
        ForeignKey(
            "companies.id",
            ondelete="RESTRICT",
        ),
        nullable=False,
        index=True,
    )

    # New / Reviewed / Spam / Rejected / Converted
    status_id: Mapped[int | None] = mapped_column(
        ForeignKey(
            "lead_statuses.id",
            ondelete="RESTRICT",
        ),
        nullable=True,
        index=True,
    )

    # Client information
    first_name: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    email: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
        index=True,
    )

    phone: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    country_code: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True,
    )

    client_company_name: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    # Enquiry information
    message: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    website_url: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    industry: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    interested: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    skype_whatsapp: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    link: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    # Page tracking
    first_page: Mapped[str | None] = mapped_column(
        String(1000),
        nullable=True,
    )

    pre_page: Mapped[str | None] = mapped_column(
        String(1000),
        nullable=True,
    )

    # UTM tracking
    utm_campaign: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    utm_medium: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    utm_source: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    utm_term: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    # Location
    ip: Mapped[str | None] = mapped_column(
        String(45),
        nullable=True,
    )

    city: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    country: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    # contact_us / free_quote / consultant / newsletter
    lead_type: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
        index=True,
    )

    # website / facebook / google_ads / manual etc.
    source: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
        index=True,
    )

    tag: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    is_converted: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    # Relationships
    company: Mapped["Company"] = relationship(
        "Company",
        back_populates="leads",
    )

    status: Mapped["LeadStatus | None"] = relationship(
        "LeadStatus",
        back_populates="leads",
    )