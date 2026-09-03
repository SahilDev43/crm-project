export type DateRangePreset =
    | 'today'
    | 'this_week'
    | 'this_month'
    | 'last_month'
    | 'this_quarter'
    | 'this_year'
    | 'custom'

export const PRESET_LABELS: Record<DateRangePreset, string> = {
    today: 'Today',
    this_week: 'This Week',
    this_month: 'This Month',
    last_month: 'Last Month',
    this_quarter: 'This Quarter',
    this_year: 'This Year',
    custom: 'Custom',
}

const toKey = (date: Date): string => {
    const pad = (value: number) => String(value).padStart(2, '0')
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/** Calculates [date_from, date_to] (inclusive, local time) for a preset. */
export const resolvePreset = (
    preset: DateRangePreset,
): { dateFrom: string; dateTo: string } | null => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    switch (preset) {
        case 'today':
            return { dateFrom: toKey(today), dateTo: toKey(today) }

        case 'this_week': {
            const day = today.getDay()
            const diffToMonday = day === 0 ? 6 : day - 1
            const start = new Date(today)
            start.setDate(today.getDate() - diffToMonday)
            return { dateFrom: toKey(start), dateTo: toKey(today) }
        }

        case 'this_month': {
            const start = new Date(today.getFullYear(), today.getMonth(), 1)
            return { dateFrom: toKey(start), dateTo: toKey(today) }
        }

        case 'last_month': {
            const start = new Date(today.getFullYear(), today.getMonth() - 1, 1)
            const end = new Date(today.getFullYear(), today.getMonth(), 0)
            return { dateFrom: toKey(start), dateTo: toKey(end) }
        }

        case 'this_quarter': {
            const quarterStartMonth = Math.floor(today.getMonth() / 3) * 3
            const start = new Date(today.getFullYear(), quarterStartMonth, 1)
            return { dateFrom: toKey(start), dateTo: toKey(today) }
        }

        case 'this_year': {
            const start = new Date(today.getFullYear(), 0, 1)
            return { dateFrom: toKey(start), dateTo: toKey(today) }
        }

        case 'custom':
        default:
            return null
    }
}
