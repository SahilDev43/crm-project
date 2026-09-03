class AttendanceReport:
    """Policy constants for attendance reporting.

    The schema has no per-company shift/holiday configuration, so
    "present" and "late" are derived from the only facts we actually
    have: whether a day has logged working time, and what time the
    first punch-in of the day happened. LATE_THRESHOLD_HOUR is a single
    default cutoff (24h, server/UTC clock) until real shift settings
    exist per company.
    """

    LATE_THRESHOLD_HOUR = 10
