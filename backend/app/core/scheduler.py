"""Background job scheduler.

Runs recurring maintenance tasks in-process alongside the API.  Currently this
is only the attendance auto punch-out, which closes any session still open past
its punch-in day's midnight (see ``app.commands.close_expired_attendance``).

The job runs hourly rather than once at midnight so a short outage never skips
a whole day — ``close_expired_attendance`` is idempotent, so re-running it is
harmless.  It also fires once a few seconds after startup to catch sessions
left open while the server was down.
"""

import structlog
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.date import DateTrigger
from datetime import datetime, timedelta

from app.commands.close_expired_attendance import close_expired_attendance
from app.core.timezone import BUSINESS_TIMEZONE

log = structlog.get_logger(__name__)

_scheduler: AsyncIOScheduler | None = None


async def _run_close_expired_attendance() -> None:
    try:
        await close_expired_attendance()
    except Exception:
        log.exception("close_expired_attendance job failed")


def start_scheduler() -> AsyncIOScheduler:
    global _scheduler

    if _scheduler is not None:
        return _scheduler

    scheduler = AsyncIOScheduler(timezone=BUSINESS_TIMEZONE)

    scheduler.add_job(
        _run_close_expired_attendance,
        trigger=CronTrigger(minute=5, timezone=BUSINESS_TIMEZONE),
        id="close_expired_attendance",
        name="Auto punch-out expired attendance sessions",
        coalesce=True,
        max_instances=1,
        misfire_grace_time=3600,
        replace_existing=True,
    )

    # Catch-up run shortly after boot.
    scheduler.add_job(
        _run_close_expired_attendance,
        trigger=DateTrigger(
            run_date=datetime.now(BUSINESS_TIMEZONE) + timedelta(seconds=10),
        ),
        id="close_expired_attendance_startup",
        name="Auto punch-out catch-up on startup",
        coalesce=True,
        max_instances=1,
    )

    scheduler.start()
    _scheduler = scheduler

    log.info("scheduler started", jobs=[j.id for j in scheduler.get_jobs()])

    return scheduler


def shutdown_scheduler() -> None:
    global _scheduler

    if _scheduler is None:
        return

    _scheduler.shutdown(wait=False)
    _scheduler = None

    log.info("scheduler stopped")
