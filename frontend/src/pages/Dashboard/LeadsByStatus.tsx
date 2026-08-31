import { getLeadStatusCounts } from '../../api/dashboard'
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
    '#ef4444',
    '#0ea5e9',
    '#64748b',
]

const CODE_COLORS: Record<string, string> = {
    new: '#3b82f6',
    reviewed: '#f59e0b',
    converted: '#22c55e',
    rejected: '#ef4444',
    spam: '#64748b',
}

const colorFor = (status: StatusCount, index: number): string =>
    CODE_COLORS[status.code.toLowerCase()] ??
    PALETTE[index % PALETTE.length]

function LeadsByStatus() {
    const { data, loading, error, reload } = useWidget(
        () => getLeadStatusCounts(),
        [],
    )

    return (
        <WidgetCard title="Leads Overview">
            <p className="-mt-1 mb-3 text-xs text-slate-400">By status</p>

            {loading ? (
                <WidgetSkeleton rows={4} />
            ) : error ? (
                <WidgetError onRetry={reload} />
            ) : !data || data.total === 0 ? (
                <WidgetEmpty message="No leads found" />
            ) : (
                <ul className="space-y-3">
                    {data.statuses.map((status, index) => {
                        const pct =
                            data.total > 0
                                ? Math.round(
                                      (status.count / data.total) * 100,
                                  )
                                : 0

                        return (
                            <li key={status.id}>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="font-medium text-slate-600">
                                        {status.name}
                                    </span>
                                    <span className="text-slate-400">
                                        {formatCount(status.count)} · {pct}%
                                    </span>
                                </div>

                                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
                                    <div
                                        className="h-full rounded-full"
                                        style={{
                                            width: `${Math.max(pct, status.count > 0 ? 3 : 0)}%`,
                                            backgroundColor: colorFor(
                                                status,
                                                index,
                                            ),
                                        }}
                                    />
                                </div>
                            </li>
                        )
                    })}

                    <li className="flex items-center justify-between border-t border-slate-100 pt-2.5 text-xs font-semibold text-slate-700">
                        <span>Total</span>
                        <span>{formatCount(data.total)}</span>
                    </li>
                </ul>
            )}
        </WidgetCard>
    )
}

export default LeadsByStatus
