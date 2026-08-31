from datetime import datetime, time, timedelta

from sqlalchemy import select

import app.db.models
from app.core.timezone import BUSINESS_TIMEZONE
from app.db.session import AsyncSessionFactory
from app.modules.attendance.model import Attendance
from app.modules.attendance.session_model import AttendanceSession


async def close_expired_attendance():
    now = datetime.now(BUSINESS_TIMEZONE)

    closed_count = 0


    today = now.date()
    midnight = datetime.combine(
        today + timedelta(days=1),
        time.min,
        tzinfo=BUSINESS_TIMEZONE,
    )

    async with AsyncSessionFactory() as db:

        result = await db.execute(
            select(AttendanceSession)
            .where(
                AttendanceSession.punch_out_at.is_(None),
                AttendanceSession.is_deleted.is_(False),
                AttendanceSession.punch_in_at < midnight,
            )
        )

        sessions = result.scalars().all()

        for session in sessions:

            session_local_date = session.punch_in_at.astimezone(
                BUSINESS_TIMEZONE
            ).date()

            session_midnight = datetime.combine(
                session_local_date + timedelta(days=1),
                time.min,
                tzinfo=BUSINESS_TIMEZONE,
            )

            if now < session_midnight:
                continue

            punch_out_at = session_midnight

            total_seconds = int(
                (
                    punch_out_at - session.punch_in_at
                ).total_seconds()
            )

            session.punch_out_at = punch_out_at
            session.total_time = max(
                total_seconds,
                0,
            )
            session.auto_closed = True
            closed_count += 1

            # Recalculate attendance total
            attendance_result = await db.execute(
                select(Attendance).where(
                    Attendance.id == session.attendance_id,
                    Attendance.is_deleted.is_(False),
                )
            )

            attendance = (
                attendance_result
                .scalar_one_or_none()
            )

            if attendance:

                sessions_result = await db.execute(
                    select(AttendanceSession)
                    .where(
                        AttendanceSession.attendance_id
                        == attendance.id,
                        AttendanceSession.is_deleted.is_(False),
                        AttendanceSession.punch_out_at.is_not(None),
                    )
                )

                completed_sessions = (
                    sessions_result.scalars().all()
                )

                attendance.total_time = sum(
                    s.total_time or 0
                    for s in completed_sessions
                )

        await db.commit()

        print(
            f"Closed {closed_count} expired attendance sessions."
        )

        return closed_count

if __name__ == "__main__":
    import asyncio

    asyncio.run(close_expired_attendance())