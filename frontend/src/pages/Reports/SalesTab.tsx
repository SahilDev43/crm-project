import { Handshake, TrendingDown, TrendingUp, Users } from 'lucide-react'

import { useAuth } from '../../auth/AuthContext'
import {
    getDealPerformanceReport,
    getDealPipelineReport,
    getLeadSourceReport,
    getLeadStatusReport,
    getSalesReport,
} from '../../api/reports'
import StatCard from '../Dashboard/StatCard'
import { WidgetCard, WidgetEmpty, WidgetError, WidgetSkeleton } from '../Dashboard/widgetChrome'
import { useWidget } from '../Dashboard/useWidget'
import { CategoryBarChart, ReportDonutChart } from './charts'
import { formatMoney, formatPercent } from './reportFormat'

interface TabFilters {
    dateFrom: string
    dateTo: string
    employeeId: number | null
}

function safeRate(numerator: number, denominator: number): number {
    if (!denominator) return 0
    return Math.round((numerator / denominator) * 1000) / 10
}

function SalesTab({ dateFrom, dateTo, employeeId }: TabFilters) {
    const { hasPermission } = useAuth()
    const params = { date_from: dateFrom, date_to: dateTo, user_id: employeeId ?? undefined }
    const deps = [dateFrom, dateTo, employeeId]

    const sales = useWidget(() => getSalesReport(params), deps)
    const leadStatus = useWidget(() => getLeadStatusReport(params), deps)
    const leadSources = useWidget(() => getLeadSourceReport(params), deps)
    const pipeline = useWidget(() => getDealPipelineReport(params), deps)

    const canSeePerformers = hasPermission('reports.performance')
    const performers = useWidget(
        () => getDealPerformanceReport({ ...params, page: 1, page_size: 5 }),
        canSeePerformers ? deps : [],
    )

    const winRate = sales.data ? safeRate(sales.data.won_deals, sales.data.total_deals) : 0

    return (
        <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                <StatCard
                    label="Total Leads"
                    value={sales.data?.total_leads ?? null}
                    icon={Users}
                    tone="blue"
                    loading={sales.loading}
                    error={!!sales.error}
                />
                <StatCard
                    label="Converted Leads"
                    value={sales.data?.converted_leads ?? null}
                    icon={TrendingUp}
                    tone="green"
                    loading={sales.loading}
                    error={!!sales.error}
                    hint={sales.data ? `${formatPercent(sales.data.conversion_rate)} conversion` : undefined}
                />
                <StatCard
                    label="Lost Leads"
                    value={sales.data?.lost_leads ?? null}
                    icon={TrendingDown}
                    tone="red"
                    loading={sales.loading}
                    error={!!sales.error}
                />
                <StatCard
                    label="Total Deals"
                    value={sales.data?.total_deals ?? null}
                    icon={Handshake}
                    tone="purple"
                    loading={sales.loading}
                    error={!!sales.error}
                />
                <StatCard
                    label="Won Deals"
                    value={sales.data?.won_deals ?? null}
                    icon={TrendingUp}
                    tone="green"
                    loading={sales.loading}
                    error={!!sales.error}
                />
                <StatCard
                    label="Win Rate"
                    value={sales.data ? winRate : null}
                    icon={TrendingUp}
                    tone="amber"
                    loading={sales.loading}
                    error={!!sales.error}
                    hint={sales.data ? '%' : undefined}
                />
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
                <WidgetCard title="Leads by Status">
                    <CategoryBarChart
                        data={(leadStatus.data ?? []).map((row) => ({
                            label: row.status_name,
                            value: row.count,
                        }))}
                        loading={leadStatus.loading}
                        error={!!leadStatus.error}
                        onRetry={leadStatus.reload}
                        valueLabel="Leads"
                    />
                </WidgetCard>

                <WidgetCard title="Lead Sources">
                    <ReportDonutChart
                        data={(leadSources.data ?? []).map((row) => ({
                            label: row.source,
                            value: row.count,
                        }))}
                        loading={leadSources.loading}
                        error={!!leadSources.error}
                        onRetry={leadSources.reload}
                    />
                </WidgetCard>
            </div>

            <WidgetCard title="Deal Pipeline">
                {pipeline.loading ? (
                    <WidgetSkeleton rows={4} />
                ) : pipeline.error ? (
                    <WidgetError onRetry={pipeline.reload} />
                ) : !pipeline.data || pipeline.data.length === 0 ? (
                    <WidgetEmpty message="No data available for this period." />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-xs font-medium uppercase text-slate-400">
                                    <th className="pb-2">Status</th>
                                    <th className="pb-2 text-right">Count</th>
                                    <th className="pb-2 text-right">Value</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {pipeline.data.map((row) => (
                                    <tr key={row.status_id}>
                                        <td className="py-2 text-slate-700">{row.status_name}</td>
                                        <td className="py-2 text-right text-slate-900">{row.count}</td>
                                        <td className="py-2 text-right text-slate-900">
                                            {formatMoney(row.total_value)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </WidgetCard>

            {canSeePerformers && (
                <WidgetCard title="Top Performers">
                    {performers.loading ? (
                        <WidgetSkeleton rows={4} />
                    ) : performers.error ? (
                        <WidgetError onRetry={performers.reload} />
                    ) : !performers.data || performers.data.items.length === 0 ? (
                        <WidgetEmpty message="No data available for this period." />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-xs font-medium uppercase text-slate-400">
                                        <th className="pb-2">Employee</th>
                                        <th className="pb-2 text-right">Total Deals</th>
                                        <th className="pb-2 text-right">Won</th>
                                        <th className="pb-2 text-right">Lost</th>
                                        <th className="pb-2 text-right">Win Rate</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {performers.data.items.map((row) => (
                                        <tr key={row.user_id}>
                                            <td className="py-2 text-slate-700">{row.user_name}</td>
                                            <td className="py-2 text-right text-slate-900">{row.total_deals}</td>
                                            <td className="py-2 text-right text-emerald-600">{row.won_deals}</td>
                                            <td className="py-2 text-right text-red-600">{row.lost_deals}</td>
                                            <td className="py-2 text-right text-slate-900">
                                                {formatPercent(row.win_rate)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </WidgetCard>
            )}
        </div>
    )
}

export default SalesTab
