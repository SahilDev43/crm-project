import { useState } from 'react'
import { ChevronLeft, ChevronRight, MinusCircle, PiggyBank, Wallet, WalletCards } from 'lucide-react'

import { getPayrollEmployeeReport, getPayrollReport } from '../../api/reports'
import { WidgetCard, WidgetEmpty, WidgetError, WidgetSkeleton } from '../Dashboard/widgetChrome'
import { useWidget } from '../Dashboard/useWidget'
import { formatMoney } from './reportFormat'

interface TabFilters {
    employeeId: number | null
}

const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
]

function MoneyStat({
    label,
    value,
    icon: Icon,
    tone,
    loading,
    error,
}: {
    label: string
    value: string | number | undefined
    icon: typeof PiggyBank
    tone: string
    loading: boolean
    error: boolean
    isMoney?: boolean
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
                        <p className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">{value ?? '—'}</p>
                    )}
                </div>
            </div>
        </div>
    )
}

function PayrollTab({ employeeId }: TabFilters) {
    const now = new Date()
    const [month, setMonth] = useState(now.getMonth() + 1)
    const [year, setYear] = useState(now.getFullYear())
    const [page, setPage] = useState(1)

    const params = { month, year, user_id: employeeId ?? undefined }
    const totals = useWidget(() => getPayrollReport(params), [month, year, employeeId])

    const employees = useWidget(
        () => getPayrollEmployeeReport({ ...params, page, page_size: 10 }),
        [month, year, employeeId, page],
    )

    const years = Array.from({ length: 3 }, (_, i) => now.getFullYear() - i)

    return (
        <div className="space-y-5">
            <div className="flex flex-wrap items-end gap-3">
                <div>
                    <label className="block text-xs font-medium text-slate-500">Month</label>
                    <select
                        value={month}
                        onChange={(event) => {
                            setMonth(Number(event.target.value))
                            setPage(1)
                        }}
                        className="mt-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    >
                        {MONTH_NAMES.map((name, index) => (
                            <option key={name} value={index + 1}>
                                {name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-medium text-slate-500">Year</label>
                    <select
                        value={year}
                        onChange={(event) => {
                            setYear(Number(event.target.value))
                            setPage(1)
                        }}
                        className="mt-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    >
                        {years.map((y) => (
                            <option key={y} value={y}>
                                {y}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
                <MoneyStat
                    label="Gross Salary"
                    value={totals.data ? formatMoney(totals.data.total_gross_salary) : undefined}
                    icon={Wallet}
                    tone="bg-blue-50 text-blue-600"
                    loading={totals.loading}
                    error={!!totals.error}
                />
                <MoneyStat
                    label="Deductions"
                    value={totals.data ? formatMoney(totals.data.total_deductions) : undefined}
                    icon={MinusCircle}
                    tone="bg-amber-50 text-amber-600"
                    loading={totals.loading}
                    error={!!totals.error}
                />
                <MoneyStat
                    label="Net Salary"
                    value={totals.data ? formatMoney(totals.data.total_net_salary) : undefined}
                    icon={PiggyBank}
                    tone="bg-emerald-50 text-emerald-600"
                    loading={totals.loading}
                    error={!!totals.error}
                />
                <MoneyStat
                    label="Paid"
                    value={totals.data?.paid_payroll}
                    icon={WalletCards}
                    tone="bg-emerald-50 text-emerald-600"
                    loading={totals.loading}
                    error={!!totals.error}
                />
                <MoneyStat
                    label="Pending"
                    value={totals.data?.pending_payroll}
                    icon={WalletCards}
                    tone="bg-slate-100 text-slate-600"
                    loading={totals.loading}
                    error={!!totals.error}
                />
            </div>

            <WidgetCard title="Payroll by Employee">
                {employees.loading ? (
                    <WidgetSkeleton rows={5} />
                ) : employees.error ? (
                    <WidgetError onRetry={employees.reload} />
                ) : !employees.data || employees.data.items.length === 0 ? (
                    <WidgetEmpty message="No data available for this period." />
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-xs font-medium uppercase text-slate-400">
                                        <th className="pb-2">Employee</th>
                                        <th className="pb-2 text-right">Gross</th>
                                        <th className="pb-2 text-right">Deductions</th>
                                        <th className="pb-2 text-right">Net</th>
                                        <th className="pb-2 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {employees.data.items.map((row) => (
                                        <tr key={row.user_id}>
                                            <td className="py-2 text-slate-700">{row.user_name}</td>
                                            <td className="py-2 text-right text-slate-900">
                                                {formatMoney(row.gross_salary)}
                                            </td>
                                            <td className="py-2 text-right text-slate-900">
                                                {formatMoney(row.deductions)}
                                            </td>
                                            <td className="py-2 text-right text-slate-900">
                                                {formatMoney(row.net_salary)}
                                            </td>
                                            <td className="py-2 text-right text-slate-500">{row.status}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                            <p className="text-xs text-slate-400">
                                Page {employees.data.page} of {Math.max(employees.data.total_pages, 1)}
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
                                    disabled={page >= employees.data.total_pages}
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
        </div>
    )
}

export default PayrollTab
