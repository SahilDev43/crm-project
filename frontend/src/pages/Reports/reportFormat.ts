export { formatCount, formatRevenue } from '../Dashboard/dashboardData'

/** Backend decimals arrive as strings to preserve precision; parse for display only. */
export const formatMoney = (value: string | number): string => {
    const numeric = typeof value === 'string' ? Number(value) : value
    if (Number.isNaN(numeric)) {
        return '—'
    }
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(numeric)
}

export const formatPercent = (value: number): string => `${value.toFixed(1)}%`

export const formatMinutesAsHours = (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const mins = Math.round(minutes % 60)
    return `${hours}h ${mins}m`
}
