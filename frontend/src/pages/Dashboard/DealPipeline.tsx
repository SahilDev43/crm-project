import { getDealDistribution } from '../../api/dashboard'
import type { StatusCount } from '../../api/dashboard'
import { formatCount } from './dashboardData'
import {
    WidgetCard,
    WidgetEmpty,
    WidgetError,
    WidgetSkeleton,
} from './widgetChrome'
import { useWidget } from './useWidget'

const PALETTE = [
    '#3b82f6',
    '#22c55e',
    '#a855f7',
    '#f59e0b',
    '#10b981',
    '#ef4444',
    '#0ea5e9',
    '#64748b',
]

const CODE_COLORS: Record<string, string> = {
    new: '#3b82f6',
    qualified: '#22c55e',
    proposal: '#a855f7',
    negotiation: '#f59e0b',
    won: '#10b981',
    lost: '#ef4444',
}

const colorFor = (status: StatusCount, index: number): string =>
    CODE_COLORS[status.code.toLowerCase()] ??
    PALETTE[index % PALETTE.length]

interface DealPipelineProps {
    scope: 'company' | 'mine'
    userId: number
}

function DealPipeline({ scope, userId }: DealPipelineProps) {
    const { data, loading, error, reload } = useWidget(
        () =>
            getDealDistribution(
                scope === 'mine' ? { assigned_to: userId } : {},
            ),
        [scope, userId],
    )

    const title = scope === 'mine' ? 'My Deal Pipeline' : 'Deal Pipeline'
    const shown = data ? data.statuses.slice(0, 8) : []
    const max = shown.length
        ? Math.max(...shown.map((status) => status.count), 1)
        : 1
    const grouped = shown.reduce((sum, status) => sum + status.count, 0)

    return (
        <WidgetCard title={title}>
            {loading ? (
                <WidgetSkeleton rows={5} />
            ) : error ? (
                <WidgetError onRetry={reload} />
            ) : !data || data.total === 0 ? (
                <WidgetEmpty
                    message={
                        scope === 'mine'
                            ? 'No deals assigned to you'
                            : 'No deals found'
                    }
                />
            ) : shown.length === 0 ? (
                <WidgetEmpty message="No deal statuses in use" />
            ) : (
                <ul className="space-y-3">
                    {shown.map((status, index) => {
                        const pct =
                            grouped > 0
                                ? Math.round((status.count / grouped) * 100)
                                : 0

                        return (
                            <li
                                key={status.id}
                                className="flex items-center gap-3"
                                title={`${status.name}: ${formatCount(status.count)} (${pct}%)`}
                            >
                                <span
                                    className="w-24 shrink-0 truncate text-xs font-medium"
                                    style={{ color: colorFor(status, index) }}
                                >
                                    {status.name}
                                </span>

                                <div className="relative h-7 flex-1 overflow-hidden rounded-lg bg-slate-50">
                                    <div
                                        className="h-full rounded-lg"
                                        style={{
                                            width: `${Math.max(
                                                (status.count / max) * 100,
                                                status.count > 0 ? 6 : 0,
                                            )}%`,
                                            backgroundColor: `${colorFor(status, index)}1f`,
                                        }}
                                    />
                                </div>

                                <span className="w-10 shrink-0 text-right text-xs font-semibold text-slate-700">
                                    {formatCount(status.count)}
                                </span>
                            </li>
                        )
                    })}

                    {data.sampled && (
                        <li className="pt-1 text-[11px] text-slate-400">
                            Distribution of the 100 most recent deals ·{' '}
                            {formatCount(data.total)} total
                        </li>
                    )}
                </ul>
            )}
        </WidgetCard>
    )
}

export default DealPipeline
