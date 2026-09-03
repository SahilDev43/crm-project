/**
 * Validated categorical + status palettes (light surface). Order is the
 * CVD-safety mechanism for the categorical set — keep it fixed, assign by
 * series identity, never cycle/reorder per-request.
 */
export const CATEGORICAL_COLORS = [
    '#2a78d6', // blue
    '#eb6834', // orange
    '#1baf7a', // aqua
    '#eda100', // yellow
    '#e87ba4', // magenta
    '#008300', // green
    '#4a3aa7', // violet
    '#e34948', // red
] as const

export const STATUS_COLORS = {
    good: '#0ca30c',
    warning: '#fab219',
    serious: '#ec835a',
    critical: '#d03b3b',
} as const

export const colorForIndex = (index: number): string =>
    CATEGORICAL_COLORS[index % CATEGORICAL_COLORS.length]

/** Stable color per key so the same status/source always gets the same hue. */
export function makeColorAssigner() {
    const assigned = new Map<string, string>()
    let next = 0

    return (key: string): string => {
        const existing = assigned.get(key)
        if (existing) {
            return existing
        }
        const color = colorForIndex(next)
        next += 1
        assigned.set(key, color)
        return color
    }
}
