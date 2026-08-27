from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

class Deal(Base):
    __tablename__ = "deals"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    # Basic Information
    title: Mapped[str] = mapped_column(Text, nullable=False)
    client_name: Mapped[str] = mapped_column(String(255), nullable=False)

    # Master data
    project_type_id: Mapped[int | None] = mapped_column(
        ForeignKey("project_types.id", ondelete="RESTRICT"),
        nullable=True,
        index=True,
    )

    platform_id: Mapped[int | None] = mapped_column(
        ForeignKey("deal_platforms.id", ondelete="RESTRICT"),
        nullable=True,
        index=True,
    )

    deal_status_id: Mapped[int] = mapped_column(
        ForeignKey("deal_statuses.id", ondelete="RESTRICT"),
        nullable=False,
        index=True
    )

    # Client/project information
    platform_external_id: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    job_description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    url: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    client_email: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    client_phone: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    contact_email: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    contact_phone: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    contact_description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    budget: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    meeting_time: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    # Company
    company_id: Mapped[int] = mapped_column(
        ForeignKey("companies.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )

    # Lead relationships
    lead_id: Mapped[int | None] = mapped_column(
        ForeignKey("leads.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    external_lead_id: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    # Users
    created_by: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
    )

    updated_by: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )

    accepted_by: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )

    assigned_to: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    # Meeting
    status_meeting_by_user_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )

    # General status
    status: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=1,
    )

    type: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default="now()",
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default="now()",
        onupdate=text("now()"),
    )

    # Relationships
    company = relationship("Company")

    project_type = relationship("ProjectType")

    platform = relationship("DealPlatform")

    deal_status = relationship("DealStatus")

    lead = relationship("Lead")

    creator = relationship(
        "User",
        foreign_keys=[created_by],
    )

    updater = relationship(
        "User",
        foreign_keys=[updated_by],
    )

    accepter = relationship(
        "User",
        foreign_keys=[accepted_by],
    )

    assignee = relationship(
        "User",
        foreign_keys=[assigned_to],
    )

    meeting_user = relationship(
        "User",
        foreign_keys=[status_meeting_by_user_id],
    )
