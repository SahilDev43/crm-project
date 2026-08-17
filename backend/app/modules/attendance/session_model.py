from datetime import datetime

from sqlalchemy import ForeignKey, Integer, String, Boolean
from sqlalchemy.dialects.postgresql import TIMESTAMP
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.db.mixins import TimestampMixin, SoftDeleteMixin


class AttendanceSession(
    Base,
    TimestampMixin,
    SoftDeleteMixin,
):

    __tablename__ = "attendance_sessions"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    attendance_id: Mapped[int] = mapped_column(
        ForeignKey(
            "attendance.id",
            ondelete="CASCADE",
        ),
        nullable=False,
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

    punch_in_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        nullable=False,
    )

    punch_out_at: Mapped[datetime | None] = mapped_column(
        TIMESTAMP(timezone=True),
        nullable=True,
    )

    total_time: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    auto_closed: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
        server_default="false",
    )

    in_ip_address: Mapped[str | None] = mapped_column(
        String(45),
        nullable=True,
    )

    out_ip_address: Mapped[str | None] = mapped_column(
        String(45),
        nullable=True,
    )

    attendance = relationship(
        "Attendance",
        back_populates="sessions",
    )

    user = relationship(
        "User",
    )