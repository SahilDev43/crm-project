"""Business timezone.

Attendance days roll over at local midnight in this zone, and the attendance
auto punch-out (``app.commands.close_expired_attendance``) uses it to decide a
session's cut-off.
"""

from datetime import datetime, time, timedelta
from zoneinfo import ZoneInfo

BUSINESS_TIMEZONE = ZoneInfo("Asia/Kolkata")


def next_midnight_after(moment: datetime) -> datetime:
    """The first local business-timezone midnight strictly after ``moment``."""

    local_date = moment.astimezone(BUSINESS_TIMEZONE).date()

    return datetime.combine(
        local_date + timedelta(days=1),
        time.min,
        tzinfo=BUSINESS_TIMEZONE,
    )
