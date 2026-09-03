import { useState } from 'react'
import { ChevronLeft, ChevronRight, ChevronsUpDown } from 'lucide-react'

import { getPerformanceReport } from '../../api/reports'
import { WidgetCard, WidgetEmpty, WidgetError, WidgetSkeleton } from '../Dashboard/widgetChrome'
import { useWidget } from '../Dashboard/useWidget'
import { formatMoney, formatPercent } from './reportFormat'
import type { ReportSortBy } from '../../types/report'

interface TabFilters {
    dateFrom: string
    dateTo: string
    employeeId: number | null
}

const COLUMNS: Array<{ key: ReportSortBy; label: string }> = [
    { key: 'leads', label: 'Leads' },
    { key: 'deals', label: 'Deals' },
    { key: 'won_deals', label: 'Won' },
    { key: 'win_rate', label: 'Win Rate' },
]

function PerformanceTab({ dateFrom, dateTo, employeeId }: TabFilters) {
    const [sortBy, setSortBy] = useState<ReportSortBy>('deals')
    const [page, setPage] = useState(1)

    const params = {
        date_from: dateFrom,
        date_to: dateTo,
        user_id: employeeId ?? undefined,
        sort_by: sortBy,
        page,
        page_size: 10,
    }

    const performance = useWidget(
        () => getPerformanceReport(params),
        [dateFrom, dateTo, employeeId, sortBy, page],
    )

    const changeSort = (key: ReportSortBy) => {
        setSortBy(key)
        setPage(1)
    }

    return (
        <WidgetCard title="Employee Performance">
            {performance.loading ? (
                <WidgetSkeleton rows={5} />
            ) : performance.error ? (
                <WidgetError onRetry={performance.reload} />
            ) : !performance.data || performance.data.items.length === 0 ? (
                <WidgetEmpty message="No data available for this period." />
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-xs font-medium uppercase text-slate-400">
                                    <th className="pb-2">Employee</th>
                                    {COLUMNS.map((col) => (
                                        <th key={col.key} className="pb-2 text-right">
                                            <button
                                                type="button"
                                                onClick={() => changeSort(col.key)}
                                                className={`inline-flex items-center gap-1 hover:text-slate-700 ${
                                                    sortBy === col.key ? 'text-slate-700' : ''
                                                }`}
                                            >
                                                {col.label}
                                                <ChevronsUpDown size={12} />
                                            </button>
                                        </th>
                                    ))}
                                    <th className="pb-2 text-right">Invoices</th>
                                    <th className="pb-2 text-right">Revenue</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {performance.data.items.map((row) => (
                                    <tr key={row.user_id}>
                                        <td className="py-2 text-slate-700">{row.user_name}</td>
                                        <td className="py-2 text-right text-slate-900">{row.leads_count}</td>
                                        <td className="py-2 text-right text-slate-900">{row.deals_count}</td>
                                        <td className="py-2 text-right text-emerald-600">{row.won_deals}</td>
                                        <td className="py-2 text-right text-slate-900">
                                            {formatPercent(row.win_rate)}
                                        </td>
                                        <td className="py-2 text-right text-slate-900">{row.invoices_count}</td>
                                        <td className="py-2 text-right text-slate-900">
                                            {formatMoney(row.revenue_generated)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                        <p className="text-xs text-slate-400">
                            Page {performance.data.page} of {Math.max(performance.data.total_pages, 1)}
                        </p>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                disabled={page <= 1}
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <button
                                type="button"
                                disabled={page >= performance.data.total_pages}
                                onClick={() => setPage((p) => p + 1)}
                                className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </>
            )}
        </WidgetCard>
    )
}

export default PerformanceTab
