/**
 * Dashboard formatting helpers.
 *
 * All dashboard numbers come from the API (see `src/api/dashboard.ts`) — this
 * file only holds display helpers, no data.
 */

/** Whole-number count: 12548 -> "12,548". */
export const formatCount = (value: number): string =>
    new Intl.NumberFormat('en-IN').format(value)

/** Rupee amount without decimals: 1245000 -> "₹12,45,000". */
export const formatRevenue = (value: number): string =>
    new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(value)

/** Local calendar date as `YYYY-MM-DD`. */
export const todayKey = (): string => {
    const now = new Date()
    const pad = (value: number) => String(value).padStart(2, '0')

    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

/** UTC calendar date as `YYYY-MM-DD` (the backend keys attendance off UTC). */
export const utcDateKey = (): string => new Date().toISOString().slice(0, 10)

/** "3 hours ago" style relative time from an ISO timestamp. */
export const timeAgo = (iso: string): string => {
    const then = new Date(
        /[zZ]$/.test(iso) || /[+-]\d{2}:?\d{2}$/.test(iso) ? iso : `${iso}Z`,
    ).getTime()

    if (Number.isNaN(then)) {
        return ''
    }

    const seconds = Math.round((Date.now() - then) / 1000)

    if (seconds < 60) {
        return 'just now'
    }

    const minutes = Math.round(seconds / 60)

    if (minutes < 60) {
        return `${minutes} min${minutes === 1 ? '' : 's'} ago`
    }

    const hours = Math.round(minutes / 60)

    if (hours < 24) {
        return `${hours} hour${hours === 1 ? '' : 's'} ago`
    }

    const days = Math.round(hours / 24)

    if (days < 30) {
        return `${days} day${days === 1 ? '' : 's'} ago`
    }

    return new Date(then).toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'short',
    })
}
