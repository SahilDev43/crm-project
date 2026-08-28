/**
 * Formatting helpers for attendance timestamps and durations.
 *
 * Session timestamps come from the API as ISO strings.  They are stored as
 * timezone-aware values, but we defensively treat a designator-less string as
 * UTC so a running timer never drifts by the browser's offset.
 */

const hasTimezone = (value: string): boolean =>
    /[zZ]$/.test(value) || /[+-]\d{2}:?\d{2}$/.test(value)

const parseTimestamp = (value: string): Date =>
    new Date(hasTimezone(value) ? value : `${value}Z`)

export const formatTime = (value: string): string => {
    const date = parseTimestamp(value)

    if (Number.isNaN(date.getTime())) {
        return value
    }

    return date.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
    })
}

export const formatDateTime = (value: string): string => {
    const date = parseTimestamp(value)

    if (Number.isNaN(date.getTime())) {
        return value
    }

    return date.toLocaleString(undefined, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

/** `attendance_date` is a plain calendar date (`YYYY-MM-DD`). */
export const formatDate = (value: string): string => {
    const date = new Date(`${value}T00:00:00`)

    if (Number.isNaN(date.getTime())) {
        return value
    }

    return date.toLocaleDateString(undefined, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    })
}

export const elapsedSeconds = (
    fromValue: string,
    nowMs: number,
): number => {
    const start = parseTimestamp(fromValue).getTime()

    if (Number.isNaN(start)) {
        return 0
    }

    return Math.max(0, Math.floor((nowMs - start) / 1000))
}

/** Stopwatch-style elapsed time, e.g. `00:00:01` counting up every second. */
export const formatStopwatch = (
    totalSeconds: number | null | undefined,
): string => {
    if (
        totalSeconds == null ||
        Number.isNaN(totalSeconds) ||
        totalSeconds < 0
    ) {
        return '00:00:00'
    }

    const seconds = Math.floor(totalSeconds)
    const pad = (value: number) => String(value).padStart(2, '0')

    return [
        pad(Math.floor(seconds / 3600)),
        pad(Math.floor((seconds % 3600) / 60)),
        pad(seconds % 60),
    ].join(':')
}

export const formatDuration = (
    totalSeconds: number | null | undefined,
    withSeconds = false,
): string => {
    if (
        totalSeconds == null ||
        Number.isNaN(totalSeconds) ||
        totalSeconds < 0
    ) {
        return '—'
    }

    const seconds = Math.floor(totalSeconds)
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const pad = (value: number) => String(value).padStart(2, '0')

    const base = `${pad(hours)}h ${pad(minutes)}m`

    return withSeconds ? `${base} ${pad(seconds % 60)}s` : base
}

/** Local calendar date as `YYYY-MM-DD`. */
export const todayKey = (): string => {
    const now = new Date()
    const pad = (value: number) => String(value).padStart(2, '0')

    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

/**
 * UTC calendar date as `YYYY-MM-DD`.  The backend keys `attendance_date` off
 * `datetime.now(timezone.utc).date()`, so a record for "today" can carry the
 * UTC date, which is a day behind the local date for +ve offsets after
 * midnight local time.
 */
export const utcDateKey = (): string =>
    new Date().toISOString().slice(0, 10)
