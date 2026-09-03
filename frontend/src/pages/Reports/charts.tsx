import type { ReactNode } from 'react'
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts'

import { WidgetEmpty, WidgetError, WidgetSkeleton } from '../Dashboard/widgetChrome'
import { CATEGORICAL_COLORS } from './reportColors'

interface ChartShellProps {
    loading: boolean
    error: boolean
    onRetry?: () => void
    empty: boolean
    height?: number
    children: ReactNode
}

const EMPTY_MESSAGE = 'No data available for this period.'

function ChartShell({ loading, error, onRetry, empty, height = 260, children }: ChartShellProps) {
    if (loading) {
        return <WidgetSkeleton rows={5} />
    }

    if (error) {
        return <WidgetError onRetry={onRetry} />
    }

    if (empty) {
        return <WidgetEmpty message={EMPTY_MESSAGE} />
    }

    return <div style={{ width: '100%', height }}>{children}</div>
}

const AXIS_TICK = { fill: '#64748b', fontSize: 12 }
const GRID_STROKE = '#e2e8f0'

// ---------------------------------------------------------------------
// Category bar chart (single measure per category, e.g. lead status counts)
// ---------------------------------------------------------------------

export interface CategoryBarDatum {
    label: string
    value: number
}

export function CategoryBarChart({
    data,
    loading,
    error,
    onRetry,
    valueLabel = 'Count',
}: {
    data: CategoryBarDatum[]
    loading: boolean
    error: boolean
    onRetry?: () => void
    valueLabel?: string
}) {
    return (
        <ChartShell loading={loading} error={error} onRetry={onRetry} empty={data.length === 0}>
            <ResponsiveContainer>
                <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
                    <CartesianGrid stroke={GRID_STROKE} vertical={false} />
                    <XAxis
                        dataKey="label"
                        tick={AXIS_TICK}
                        axisLine={{ stroke: GRID_STROKE }}
                        tickLine={false}
                    />
                    <YAxis
                        tick={AXIS_TICK}
                        axisLine={false}
                        tickLine={false}
                        allowDecimals={false}
                    />
                    <Tooltip
                        formatter={(value: number) => [value, valueLabel]}
                        contentStyle={{ borderRadius: 8, borderColor: GRID_STROKE, fontSize: 13 }}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={40}>
                        {data.map((entry, index) => (
                            <Cell key={entry.label} fill={CATEGORICAL_COLORS[index % CATEGORICAL_COLORS.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </ChartShell>
    )
}

// ---------------------------------------------------------------------
// Donut chart (identity share, e.g. lead sources)
// ---------------------------------------------------------------------

export interface DonutDatum {
    label: string
    value: number
}

export function ReportDonutChart({
    data,
    loading,
    error,
    onRetry,
}: {
    data: DonutDatum[]
    loading: boolean
    error: boolean
    onRetry?: () => void
}) {
    return (
        <ChartShell loading={loading} error={error} onRetry={onRetry} empty={data.length === 0}>
            <ResponsiveContainer>
                <PieChart>
                    <Pie
                        data={data}
                        dataKey="value"
                        nameKey="label"
                        innerRadius="55%"
                        outerRadius="80%"
                        paddingAngle={2}
                        strokeWidth={2}
                        stroke="#fff"
                    >
                        {data.map((entry, index) => (
                            <Cell
                                key={entry.label}
                                fill={CATEGORICAL_COLORS[index % CATEGORICAL_COLORS.length]}
                            />
                        ))}
                    </Pie>
                    <Legend
                        verticalAlign="bottom"
                        height={36}
                        wrapperStyle={{ fontSize: 12, color: '#475569' }}
                    />
                    <Tooltip contentStyle={{ borderRadius: 8, borderColor: GRID_STROKE, fontSize: 13 }} />
                </PieChart>
            </ResponsiveContainer>
        </ChartShell>
    )
}

// ---------------------------------------------------------------------
// Multi-series trend chart (e.g. invoiced / paid / outstanding by month)
// ---------------------------------------------------------------------

export interface TrendSeries {
    key: string
    label: string
}

export function ReportTrendChart({
    data,
    series,
    loading,
    error,
    onRetry,
    valueFormatter,
}: {
    data: Array<Record<string, string | number>>
    series: TrendSeries[]
    loading: boolean
    error: boolean
    onRetry?: () => void
    valueFormatter?: (value: number) => string
}) {
    return (
        <ChartShell loading={loading} error={error} onRetry={onRetry} empty={data.length === 0} height={300}>
            <ResponsiveContainer>
                <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
                    <CartesianGrid stroke={GRID_STROKE} vertical={false} />
                    <XAxis
                        dataKey="period"
                        tick={AXIS_TICK}
                        axisLine={{ stroke: GRID_STROKE }}
                        tickLine={false}
                    />
                    <YAxis
                        tick={AXIS_TICK}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={valueFormatter}
                    />
                    <Tooltip
                        formatter={(value: number) => (valueFormatter ? valueFormatter(value) : value)}
                        contentStyle={{ borderRadius: 8, borderColor: GRID_STROKE, fontSize: 13 }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12, color: '#475569' }} />
                    {series.map((s, index) => (
                        <Line
                            key={s.key}
                            type="monotone"
                            dataKey={s.key}
                            name={s.label}
                            stroke={CATEGORICAL_COLORS[index % CATEGORICAL_COLORS.length]}
                            strokeWidth={2}
                            dot={{ r: 4 }}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </ChartShell>
    )
}
