from datetime import date, datetime, timezone
import math

from app.common.exceptions import (
    UserNotFoundError,
    AttendanceNotFoundError,
    AttendanceSessionActiveError,
    AttendanceSessionNotActiveError,
)

from app.modules.attendance.model import Attendance
from app.modules.attendance.session_model import AttendanceSession
from app.modules.attendance.repository import AttendanceRepository

from app.modules.users.repository import UserRepository

from app.db.unit_of_work import UnitOfWork


class AttendanceService:

    def __init__(
        self,
        repo: AttendanceRepository,
        uow: UnitOfWork,
        user_repo: UserRepository,
    ):
        self.repo = repo
        self.uow = uow
        self.user_repo = user_repo

    async def punch_in(
        self,
        user_id: int,
        company_id: int,
        ip_address: str | None = None,
    ) -> AttendanceSession:

        # Validate user
        user = await self.user_repo.get_by_id(
            user_id
        )

        if not user:
            raise UserNotFoundError()

        # Check if user already has an active session
        active_session = await self.repo.get_active_session(
            user_id
        )

        if active_session:
            raise AttendanceSessionActiveError()

        now = datetime.now(timezone.utc)
        today = now.date()

        # Find today's attendance
        attendance = await self.repo.get_by_user_and_date(
            user_id=user_id,
            attendance_date=today,
        )

        # Create daily attendance if it doesn't exist
        if not attendance:

            attendance = Attendance(
                company_id=company_id,
                user_id=user_id,
                attendance_date=today,
                total_time=0,
                status=1,
            )

            async with self.uow:

                await self.repo.create(
                    attendance
                )

                await self.repo.flush()

        # Create tracker session
        session = AttendanceSession(
            attendance_id=attendance.id,
            user_id=user_id,
            punch_in_at=now,
            punch_out_at=None,
            total_time=None,
            in_ip_address=ip_address,
        )

        async with self.uow:

            await self.repo.create_session(
                session
            )

            await self.repo.flush()

        await self.repo.db.refresh(
            session
        )

        return session

    async def punch_out(
        self,
        user_id: int,
        ip_address: str | None = None,
    ) -> AttendanceSession:

        # Find active session
        session = await self.repo.get_active_session(
            user_id
        )

        if not session:
            raise AttendanceSessionNotActiveError()

        now = datetime.now(timezone.utc)

        session.punch_out_at = now
        session.out_ip_address = ip_address

        # Calculate session duration
        total_seconds = int(
            (
                now - session.punch_in_at
            ).total_seconds()
        )

        session.total_time = max(
            total_seconds,
            0,
        )

        # Update daily attendance total
        attendance = await self.repo.get_by_id(
            session.attendance_id
        )

        if attendance:

            sessions = await self.repo.get_sessions(
                attendance.id
            )

            total_time = sum(
                session.total_time or 0
                for session in sessions
            )

            # Include current session
            if session not in sessions:
                total_time += session.total_time or 0

            attendance.total_time = total_time

        async with self.uow:

            await self.repo.update_session(
                session
            )

            if attendance:
                await self.repo.update(
                    attendance
                )

            await self.repo.flush()

        await self.repo.db.refresh(
            session
        )

        return session

    async def get_attendance(
        self,
        company_id: int,
        user_id: int | None = None,
        date_from: date | None = None,
        date_to: date | None = None,
        search: str | None = None,
        page: int = 1,
        page_size: int = 20,
    ):
        items, total, session_counts = await self.repo.get_all(
            company_id=company_id,
            user_id=user_id,
            date_from=date_from,
            date_to=date_to,
            search=search,
            page=page,
            page_size=page_size,
        )

        management_items = []

        for attendance in items:
            management_items.append(
                {
                    "id": attendance.id,
                    "attendance_date": attendance.attendance_date,
                    "company_id": attendance.company_id,
                    "user_id": attendance.user_id,
                    "user": attendance.user,
                    "total_time": attendance.total_time,
                    "session_count": session_counts.get(
                        attendance.id,
                        0,
                    ),
                    "status": attendance.status,
                    "remarks": attendance.remarks,
                    "created_at": attendance.created_at,
                    "updated_at": attendance.updated_at,
                }
            )

        total_pages = math.ceil(
            total / page_size
        ) if total else 0

        return {
            "items": management_items,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": total_pages,
        }


    async def get_attendance_detail(
        self,
        attendance_id: int,
    ):
        attendance = await self.repo.get_by_id(
            attendance_id
        )

        if not attendance:
            raise AttendanceNotFoundError()

        attendance.sessions = await self.repo.get_sessions(
            attendance_id
        )

        return attendance


    async def get_sessions(
        self,
        attendance_id: int,
    ):
        attendance = await self.repo.get_by_id(
            attendance_id
        )

        if not attendance:
            raise AttendanceNotFoundError()

        return await self.repo.get_sessions(
            attendance_id
        )

    async def get_user_attendance(
        self,
        user_id: int,
        company_id: int,
    ):
        return await self.repo.get_by_user(
            user_id=user_id,
            company_id=company_id,
        )

    async def update_attendance(
        self,
        attendance_id: int,
        status: int | None = None,
        remarks: str | None = None,
        company_id: int | None = None,
    ):
        attendance = await self.repo.get_by_id(
            attendance_id
        )

        if not attendance:
            raise AttendanceNotFoundError()

        # Company isolation
        if (
            company_id is not None
            and attendance.company_id != company_id
        ):
            raise AttendanceNotFoundError()

        if status is not None:
            attendance.status = status

        if remarks is not None:
            attendance.remarks = remarks

        async with self.uow:
            await self.repo.update(attendance)
            await self.repo.flush()

        await self.repo.db.refresh(attendance)

        return attendance