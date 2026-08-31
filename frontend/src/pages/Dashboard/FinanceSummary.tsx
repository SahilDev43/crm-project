import { countInvoices } from '../../api/dashboard'
import { formatCount } from './dashboardData'
import {
    WidgetCard,
    WidgetError,
    WidgetSkeleton,
} from './widgetChrome'
import { useWidget } from './useWidget'

interface FinanceData {
    total: number
    paid: number
    outstanding: number
    overdue: number
}

function FinanceSummary() {
    const { data, loading, error, reload } = useWidget<FinanceData>(
        async () => {
            const [total, paid, issued, partial, overdue] =
                await Promise.all([
                    countInvoices(),
                    countInvoices(4),
                    countInvoices(2),
                    countInvoices(3),
                    countInvoices(5),
                ])

            return {
                total,
                paid,
                outstanding: issued + partial + overdue,
                overdue,
            }
        },
        [],
    )

    const tiles: { label: string; value: number | undefined; tone: string }[] =
        [
            {
                label: 'Total Invoices',
                value: data?.total,
                tone: 'text-slate-900',
            },
            { label: 'Paid', value: data?.paid, tone: 'text-emerald-600' },
            {
                label: 'Outstanding',
                value: data?.outstanding,
                tone: 'text-amber-600',
            },
            { label: 'Overdue', value: data?.overdue, tone: 'text-red-600' },
        ]

    return (
        <WidgetCard title="Invoices">
            {loading ? (
                <WidgetSkeleton rows={2} />
            ) : error ? (
                <WidgetError onRetry={reload} />
            ) : (
                <>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {tiles.map((tile) => (
                            <div
                                key={tile.label}
                                className="rounded-lg border border-slate-200 px-3 py-2.5"
                            >
                                <p
                                    className={`text-lg font-bold ${tile.tone}`}
                                >
                                    {tile.value === undefined
                                        ? '—'
                                        : formatCount(tile.value)}
                                </p>
                                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                    {tile.label}
                                </p>
                            </div>
                        ))}
                    </div>

                    <p className="mt-3 text-xs text-slate-400">
                        Counts only — amount totals require a finance summary
                        endpoint, which the backend does not currently expose.
                    </p>
                </>
            )}
        </WidgetCard>
    )
}

export default FinanceSummary
