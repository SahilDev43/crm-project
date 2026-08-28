/*
 * Derived attendance summary based purely on how long the user actually
 * worked that day (`total_time`, in seconds).  Computed on the client — it
 * is not a backend field.
 *
 *   worked  < 4h 45m (17100s)              -> Absent
 *   worked >= 4h 45m and < 6h 15m (22500s) -> Half Day
 *   worked >= 6h 15m and < 8h 45m (31500s) -> Short Leave
 *   worked >= 8h 45m (31500s)              -> Full Day
 *   session still open                     -> Working
 */

export const ABSENT_LIMIT_SECONDS = 17100 // 4h 45m
export const HALF_DAY_LIMIT_SECONDS = 22500 // 6h 15m
export const FULL_DAY_LIMIT_SECONDS = 31500 // 8h 45m

export type WorkSummaryKey =
    | 'working'
    | 'absent'
    | 'half-day'
    | 'short-leave'
    | 'full-day'

export interface WorkSummary {
    key: WorkSummaryKey
    label: string
    className: string
    description: string
}

export const getWorkSummary = (
    totalSeconds: number,
    sessionCount: number,
    hasOpenSession = false,
): WorkSummary => {
    if (hasOpenSession) {
        return {
            key: 'working',
            label: 'Working',
            className: 'bg-emerald-100 text-emerald-700',
            description: 'Currently punched in',
        }
    }

    if (sessionCount <= 0 || totalSeconds < ABSENT_LIMIT_SECONDS) {
        return {
            key: 'absent',
            label: 'Absent',
            className: 'bg-red-100 text-red-700',
            description: 'Worked less than 4h 45m',
        }
    }

    if (totalSeconds < HALF_DAY_LIMIT_SECONDS) {
        return {
            key: 'half-day',
            label: 'Half Day',
            className: 'bg-amber-100 text-amber-700',
            description: 'Worked 4h 45m to 6h 15m',
        }
    }

    if (totalSeconds < FULL_DAY_LIMIT_SECONDS) {
        return {
            key: 'short-leave',
            label: 'Short Leave',
            className: 'bg-orange-100 text-orange-700',
            description: 'Worked 6h 15m to 8h 45m',
        }
    }

    return {
        key: 'full-day',
        label: 'Full Day',
        className: 'bg-emerald-100 text-emerald-700',
        description: 'Worked 8h 45m or more',
    }
}

interface WorkSummaryBadgeProps {
    totalSeconds: number
    sessionCount: number
    hasOpenSession?: boolean
}

export function WorkSummaryBadge({
    totalSeconds,
    sessionCount,
    hasOpenSession = false,
}: WorkSummaryBadgeProps) {
    const summary = getWorkSummary(
        totalSeconds,
        sessionCount,
        hasOpenSession
    )

    return (
        <span
            title={summary.description}
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${summary.className}`}
        >
            {summary.label}
        </span>
    )
}
