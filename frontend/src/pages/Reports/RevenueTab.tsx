import { AlertTriangle, CircleDollarSign, PiggyBank, Receipt } from 'lucide-react'

import { getInvoiceStatusReport, getRevenueReport, getRevenueTrend } from '../../api/reports'
import { WidgetCard, WidgetEmpty, WidgetError, WidgetSkeleton } from '../Dashboard/widgetChrome'
import { useWidget } from '../Dashboard/useWidget'
import { ReportTrendChart } from './charts'
import { formatMoney } from './reportFormat'

interface TabFilters {
    dateFrom: string
    dateTo: string
}

function MoneyStat({
    label,
    value,
    icon: Icon,
    tone,
    loading,
    error,
}: {
    label: string
    value: string | undefined
    icon: typeof CircleDollarSign
    tone: string
    loading: boolean
    error: boolean
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-start gap-3 sm:gap-4">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-11 sm:w-11 ${tone}`}>
                    <Icon size={20} />
                </div>
                <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-500">{label}</p>
                    {loading ? (
                        <div className="mt-2 h-6 w-20 animate-pulse rounded bg-slate-100" />
                    ) : error ? (
                        <p className="mt-1 text-sm font-medium text-red-500">Unavailable</p>
                    ) : (
                        <p className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">
                            {value !== undefined ? formatMoney(value) : '—'}
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}

function RevenueTab({ dateFrom, dateTo }: TabFilters) {
    const params = { date_from: dateFrom, date_to: dateTo }
    const deps = [dateFrom, dateTo]

    const revenue = useWidget(() => getRevenueReport(params), deps)
    const trend = useWidget(() => getRevenueTrend(params), deps)
    const invoiceStatus = useWidget(() => getInvoiceStatusReport(params), deps)

    return (
        <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <MoneyStat
                    label="Total Invoiced"
                    value={revenue.data?.total_invoiced}
                    icon={Receipt}
                    tone="bg-blue-50 text-blue-600"
                    loading={revenue.loading}
                    error={!!revenue.error}
                />
                <MoneyStat
                    label="Total Paid"
                    value={revenue.data?.total_paid}
                    icon={PiggyBank}
                    tone="bg-emerald-50 text-emerald-600"
                    loading={revenue.loading}
                    error={!!revenue.error}
                />
                <MoneyStat
                    label="Outstanding"
                    value={revenue.data?.total_outstanding}
                    icon={CircleDollarSign}
                    tone="bg-amber-50 text-amber-600"
                    loading={revenue.loading}
                    error={!!revenue.error}
                />
                <MoneyStat
                    label="Overdue"
                    value={revenue.data?.total_overdue}
                    icon={AlertTriangle}
                    tone="bg-red-50 text-red-600"
                    loading={revenue.loading}
                    error={!!revenue.error}
                />
            </div>

            <WidgetCard title="Revenue Trend">
                <ReportTrendChart
                    data={(trend.data ?? []).map((point) => ({
                        period: point.period,
                        invoiced: Number(point.invoiced_amount),
                        paid: Number(point.paid_amount),
                        outstanding: Number(point.outstanding_amount),
                    }))}
                    series={[
                        { key: 'invoiced', label: 'Invoiced' },
                        { key: 'paid', label: 'Paid' },
                        { key: 'outstanding', label: 'Outstanding' },
                    ]}
                    loading={trend.loading}
                    error={!!trend.error}
                    onRetry={trend.reload}
                    valueFormatter={(value) => formatMoney(value)}
                />
            </WidgetCard>

            <WidgetCard title="Invoice Status">
                {invoiceStatus.loading ? (
                    <WidgetSkeleton rows={4} />
                ) : invoiceStatus.error ? (
                    <WidgetError onRetry={invoiceStatus.reload} />
                ) : !invoiceStatus.data || invoiceStatus.data.length === 0 ? (
                    <WidgetEmpty message="No data available for this period." />
                ) : (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {invoiceStatus.data.map((row) => (
                            <div
                                key={row.status}
                                className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                            >
                                <p className="text-xs font-medium uppercase text-slate-400">
                                    {row.status}
                                </p>
                                <p className="mt-1 text-lg font-bold text-slate-900">
                                    {row.count} invoice{row.count === 1 ? '' : 's'}
                                </p>
                                <p className="text-sm text-slate-500">{formatMoney(row.total_amount)}</p>
                            </div>
                        ))}
                    </div>
                )}
            </WidgetCard>
        </div>
    )
}

export default RevenueTab
