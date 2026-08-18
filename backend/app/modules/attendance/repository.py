from datetime import date

from sqlalchemy import func, or_, select
import sqlalchemy as sa
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.common.exceptions import AttendanceNotFoundError
from app.db.base_repository import BaseRepository
from app.modules.users.model import User
from app.modules.attendance.model import Attendance
from app.modules.attendance.session_model import AttendanceSession

class AttendanceRepository(BaseRepository):

    async def get_by_id(self, attendance_id: int) -> Attendance | None:

        result = await self.db.execute(
            select(Attendance).where(
                Attendance.id == attendance_id,
                Attendance.is_deleted.is_(False)
            )
        )

        return result.scalar_one_or_none()

    async def get_by_user_and_date(
        self,
        user_id: int,
        attendance_date: date
    ) -> Attendance | None:

        result = await self.db.execute(
            select(Attendance).where(
                Attendance.user_id == user_id,
                Attendance.attendance_date == attendance_date,
                Attendance.is_deleted.is_(False)
            )
        )

        return result.scalar_one_or_none()

    async def get_by_user(
        self,
        user_id: int,
        company_id: int,
    ) -> list[Attendance]:

        result = await self.db.execute(
            select(Attendance)
            .where(
                Attendance.user_id == user_id,
                Attendance.company_id == company_id,
                Attendance.is_deleted.is_(False),
            )
            .order_by(
                Attendance.attendance_date.desc(),
                Attendance.id.desc(),
            )
        )

        return list(result.scalars().all())

    async def get_all(
        self,
        company_id: int,
        user_id: int | None = None,
        date_from: date | None = None,
        date_to: date | None = None,
        search: str | None = None,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[list[Attendance], int]:

        query = (
            select(Attendance)
            .options(
                joinedload(Attendance.user)
            )
            .join(
                User,
                User.id == Attendance.user_id,
            )
            .where(
                Attendance.company_id == company_id,
                Attendance.is_deleted.is_(False),
                User.is_deleted.is_(False),
            )
        )

        if user_id is not None:
            query = query.where(
                Attendance.user_id == user_id
            )

        if date_from is not None:
            query = query.where(
                Attendance.attendance_date >= date_from
            )

        if date_to is not None:
            query = query.where(
                Attendance.attendance_date <= date_to
            )

        if search:
            search_value = f"%{search.strip()}%"

            query = query.where(
                or_(
                    User.first_name.ilike(search_value),
                    User.last_name.ilike(search_value),
                    User.email.ilike(search_value),
                )
            )

        # Total
        count_query = select(
            sa.func.count()
        ).select_from(
            query.subquery()
        )

        count_result = await self.db.execute(
            count_query
        )

        total = count_result.scalar_one()

        # Pagination
        offset = (page - 1) * page_size

        query = (
            query
            .order_by(
                Attendance.attendance_date.desc(),
                Attendance.id.desc(),
            )
            .offset(offset)
            .limit(page_size)
        )

        result = await self.db.execute(query)

        items = list(result.scalars().all())

        attendance_ids = [
            attendance.id
            for attendance in items
        ]

        session_counts: dict[int, int] = {}

        if attendance_ids:
            count_result = await self.db.execute(
                select(
                    AttendanceSession.attendance_id,
                    func.count(AttendanceSession.id),
                )
                .where(
                    AttendanceSession.attendance_id.in_(
                        attendance_ids
                    ),
                    AttendanceSession.is_deleted.is_(False),
                )
                .group_by(
                    AttendanceSession.attendance_id
                )
            )

            session_counts = dict(
                count_result.all()
            )

        return items, total, session_counts

    async def create(
        self,
        attendance: Attendance
    ) -> Attendance:

        self.db.add(attendance)

        return attendance

    async def update(
        self,
        attendance: Attendance
    ) -> Attendance:

        return attendance


    async def get_session_by_id(
        self,
        session_id: int
    ) -> AttendanceSession | None:

        result = await self.db.execute(
            select(AttendanceSession).where(
                AttendanceSession.id == session_id,
                AttendanceSession.is_deleted.is_(False)
            )
        )
        return result.scalar_one_or_none()

    async def get_active_session(
        self,
        user_id: int,
    ) -> AttendanceSession | None:

        result = await self.db.execute(
            select(AttendanceSession).where(
                AttendanceSession.user_id == user_id,
                AttendanceSession.punch_out_at.is_(None),
                AttendanceSession.is_deleted.is_(False),
            )
            .order_by(AttendanceSession.id.desc())
        )

        return result.scalars().first()

    async def get_sessions(
        self,
        attendance_id: int,
        company_id: int | None = None,
    ):
        attendance = await self.repo.get_by_id(
            attendance_id
        )

        if not attendance:
            raise AttendanceNotFoundError()

        if (
            company_id is not None
            and attendance.company_id != company_id
        ):
            raise AttendanceNotFoundError()

        return await self.repo.get_sessions(
            attendance_id
        )

    async def create_session(
        self,
        session: AttendanceSession,
    ) -> AttendanceSession:

        self.db.add(session)

        return session

    async def update_session(
        self,
        session: AttendanceSession,
    ) -> AttendanceSession:

        return session