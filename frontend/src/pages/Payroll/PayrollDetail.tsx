import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
    ArrowLeft,
    BadgeCheck,
    Loader2,
    MessageSquare,
    Printer,
} from 'lucide-react'

import { getCompany } from '../../api/companies'
import { getPayroll, getPayrollItems } from '../../api/payrolls'
import { getUser } from '../../api/users'
import { getApiErrorMessage } from '../../api/errors'
import { useAuth } from '../../auth/AuthContext'
import {
    COMPONENT_TYPE,
    PAYROLL_STATUS,
    calculationTypeLabel,
    componentTypeBadge,
    componentTypeLabel,
    employeeName,
    formatCurrency,
    formatDate,
    monthName,
    payrollStatusBadge,
    payrollStatusLabel,
} from '../../lib/payroll'
import type { PayrollDetail as PayrollDetailData, PayrollItem } from '../../types/payroll'
import PayrollPayModal from './PayrollPayModal'
import PayrollRemarksEdit from './PayrollRemarksEdit'

const PRINT_STYLES = `
@media print {
    aside, header, .no-print { display: none !important; }
    main { overflow: visible !important; }
    body { background: #ffffff !important; }
}
`

function SummaryTile({
    label,
    value,
    emphasis,
}: {
    label: string
    value: string
    emphasis?: boolean
}) {
    return (
        <div className="rounded-lg border border-slate-200 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                {label}
            </p>
            <p
                className={`mt-1 font-semibold ${
                    emphasis
                        ? 'text-lg text-slate-900'
                        : 'text-sm text-slate-800'
                }`}
            >
                {value}
            </p>
        </div>
    )
}

function PayrollDetail() {
    const { payrollId } = useParams<{ payrollId: string }>()
    const navigate = useNavigate()
    const { hasPermission, user } = useAuth()
    const companyId = user?.company_id ?? null

    const canPay = hasPermission('payroll.pay')
    const canUpdate = hasPermission('payroll.update')

    const id = Number(payrollId)

    const [payroll, setPayroll] = useState<PayrollDetailData | null>(null)
    const [items, setItems] = useState<PayrollItem[]>([])
    const [employeeLabel, setEmployeeLabel] = useState('')
    const [companyName, setCompanyName] = useState('')

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const [showPay, setShowPay] = useState(false)
    const [showRemarks, setShowRemarks] = useState(false)

    const load = useCallback(async () => {
        if (!Number.isFinite(id)) {
            setError('Invalid payroll.')
            setLoading(false)
            return
        }

        try {
            setLoading(true)
            setError('')

            const [payrollData, itemData] = await Promise.all([
                getPayroll(id),
                getPayrollItems(id),
            ])

            setPayroll(payrollData)
            setItems(itemData)

            const [userResult, companyResult] = await Promise.allSettled([
                getUser(payrollData.user_id),
                companyId
                    ? getCompany(companyId)
                    : Promise.reject(new Error('no company')),
            ])

            setEmployeeLabel(
                userResult.status === 'fulfilled'
                    ? `${employeeName(userResult.value, payrollData.user_id)} (${
                          userResult.value.email
                      })`
                    : `User #${payrollData.user_id}`,
            )

            setCompanyName(
                companyResult.status === 'fulfilled'
                    ? companyResult.value.name
                    : '',
            )
        } catch (err: unknown) {
            setError(getApiErrorMessage(err, 'Unable to load payroll.'))
        } finally {
            setLoading(false)
        }
    }, [id, companyId])

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        void load()
    }, [load])

    if (loading) {
        return (
            <div className="flex items-center justify-center gap-2 p-10 text-sm text-slate-500">
                <Loader2 size={16} className="animate-spin" />
                Loading payroll...
            </div>
        )
    }

    if (error || !payroll) {
        return (
            <div className="p-6">
                <button
                    type="button"
                    onClick={() => navigate('/payroll')}
                    className="mb-4 flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                    <ArrowLeft size={16} />
                    Back to Payroll
                </button>

                <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error || 'Payroll not found.'}
                </div>
            </div>
        )
    }

    const earnings = items.filter(
        (item) => item.component_type === COMPONENT_TYPE.EARNING,
    )
    const deductions = items.filter(
        (item) => item.component_type === COMPONENT_TYPE.DEDUCTION,
    )
    const isPaid = payroll.status === PAYROLL_STATUS.PAID
    const period = `${monthName(payroll.payroll_month)} ${payroll.payroll_year}`

    return (
        <div className="p-6">

            <style>{PRINT_STYLES}</style>

            <div className="no-print flex flex-wrap items-center justify-between gap-3">
                <button
                    type="button"
                    onClick={() => navigate('/payroll')}
                    className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                    <ArrowLeft size={16} />
                    Back to Payroll
                </button>

                <div className="flex items-center gap-2">
                    {canUpdate && (
                        <button
                            type="button"
                            onClick={() => setShowRemarks(true)}
                            className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                            <MessageSquare size={16} />
                            Edit Remarks
                        </button>
                    )}

                    {canPay && !isPaid && (
                        <button
                            type="button"
                            onClick={() => setShowPay(true)}
                            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
                        >
                            <BadgeCheck size={16} />
                            Mark as Paid
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={() => window.print()}
                        className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700"
                    >
                        <Printer size={16} />
                        Print Payslip
                    </button>
                </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">

                {/* Payslip header */}
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
                    <div>
                        <p className="text-lg font-bold text-slate-900">
                            {companyName || 'Payslip'}
                        </p>
                        <p className="mt-0.5 text-sm text-slate-500">
                            Payslip for {period}
                        </p>
                    </div>

                    <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${payrollStatusBadge(
                            payroll.status,
                        )}`}
                    >
                        {payrollStatusLabel(payroll.status)}
                    </span>
                </div>

                {/* Payroll information */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-4 px-6 py-5 sm:grid-cols-3 lg:grid-cols-4">
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                            Employee
                        </p>
                        <p className="mt-1 text-sm text-slate-800">
                            {employeeLabel}
                        </p>
                    </div>
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                            Month
                        </p>
                        <p className="mt-1 text-sm text-slate-800">
                            {monthName(payroll.payroll_month)}
                        </p>
                    </div>
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                            Year
                        </p>
                        <p className="mt-1 text-sm text-slate-800">
                            {payroll.payroll_year}
                        </p>
                    </div>
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                            Paid Date
                        </p>
                        <p className="mt-1 text-sm text-slate-800">
                            {payroll.paid_at
                                ? formatDate(payroll.paid_at)
                                : '—'}
                        </p>
                    </div>
                    <div className="col-span-2 sm:col-span-3 lg:col-span-4">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                            Remarks
                        </p>
                        <p className="mt-1 text-sm text-slate-700">
                            {payroll.remarks || '—'}
                        </p>
                    </div>
                </div>

                {/* Salary summary */}
                <div className="grid grid-cols-2 gap-3 border-t border-slate-200 px-6 py-5 sm:grid-cols-4">
                    <SummaryTile
                        label="Basic Salary"
                        value={formatCurrency(payroll.basic_salary)}
                    />
                    <SummaryTile
                        label="Gross Salary"
                        value={formatCurrency(payroll.gross_salary)}
                    />
                    <SummaryTile
                        label="Total Deductions"
                        value={formatCurrency(payroll.total_deductions)}
                    />
                    <SummaryTile
                        label="Net Salary"
                        value={formatCurrency(payroll.net_salary)}
                        emphasis
                    />
                </div>

                {/* Earnings / Deductions split */}
                <div className="grid gap-6 border-t border-slate-200 px-6 py-5 lg:grid-cols-2">
                    <div>
                        <h3 className="text-sm font-semibold text-slate-900">
                            Earnings
                        </h3>

                        <table className="mt-2 w-full text-left text-sm">
                            <tbody className="divide-y divide-slate-100">
                                <tr>
                                    <td className="py-2 text-slate-600">
                                        Basic Salary
                                    </td>
                                    <td className="py-2 text-right font-medium text-slate-800">
                                        {formatCurrency(payroll.basic_salary)}
                                    </td>
                                </tr>

                                {earnings.map((item) => (
                                    <tr key={item.id}>
                                        <td className="py-2 text-slate-600">
                                            {item.component_name}
                                            <span className="ml-1 text-xs text-slate-400">
                                                ({item.component_code})
                                            </span>
                                        </td>
                                        <td className="py-2 text-right font-medium text-slate-800">
                                            {formatCurrency(
                                                item.calculated_amount,
                                            )}
                                        </td>
                                    </tr>
                                ))}

                                <tr className="border-t-2 border-slate-200">
                                    <td className="py-2 font-semibold text-slate-700">
                                        Gross Salary
                                    </td>
                                    <td className="py-2 text-right font-semibold text-slate-900">
                                        {formatCurrency(payroll.gross_salary)}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-slate-900">
                            Deductions
                        </h3>

                        <table className="mt-2 w-full text-left text-sm">
                            <tbody className="divide-y divide-slate-100">
                                {deductions.length === 0 ? (
                                    <tr>
                                        <td className="py-2 text-slate-400">
                                            No deductions
                                        </td>
                                        <td />
                                    </tr>
                                ) : (
                                    deductions.map((item) => (
                                        <tr key={item.id}>
                                            <td className="py-2 text-slate-600">
                                                {item.component_name}
                                                <span className="ml-1 text-xs text-slate-400">
                                                    ({item.component_code})
                                                </span>
                                            </td>
                                            <td className="py-2 text-right font-medium text-slate-800">
                                                {formatCurrency(
                                                    item.calculated_amount,
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}

                                <tr className="border-t-2 border-slate-200">
                                    <td className="py-2 font-semibold text-slate-700">
                                        Total Deductions
                                    </td>
                                    <td className="py-2 text-right font-semibold text-slate-900">
                                        {formatCurrency(
                                            payroll.total_deductions,
                                        )}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Net salary line */}
                <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4">
                    <span className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                        Net Salary
                    </span>
                    <span className="text-xl font-bold text-slate-900">
                        {formatCurrency(payroll.net_salary)}
                    </span>
                </div>
            </div>

            {/* Full component breakdown */}
            <h2 className="mt-8 text-lg font-semibold text-slate-900">
                Salary Components
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
                Backend-calculated snapshot for this payroll run.
            </p>

            <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-white">
                {items.length === 0 ? (
                    <div className="p-8 text-center text-sm text-slate-500">
                        This payroll has no component items.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="border-b border-slate-200 bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500">
                                        Component
                                    </th>
                                    <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500">
                                        Code
                                    </th>
                                    <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500">
                                        Type
                                    </th>
                                    <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500">
                                        Calculation Type
                                    </th>
                                    <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500">
                                        Calculation Value
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-slate-500">
                                        Calculated Amount
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {items.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="hover:bg-slate-50"
                                    >
                                        <td className="px-6 py-4 text-sm font-medium text-slate-900">
                                            {item.component_name}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="rounded bg-slate-100 px-2 py-1 font-mono text-xs text-slate-700">
                                                {item.component_code}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${componentTypeBadge(
                                                    item.component_type,
                                                )}`}
                                            >
                                                {componentTypeLabel(
                                                    item.component_type,
                                                )}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {calculationTypeLabel(
                                                item.calculation_type,
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {item.calculation_value}
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm font-medium text-slate-800">
                                            {formatCurrency(
                                                item.calculated_amount,
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {showPay && (
                <PayrollPayModal
                    payrollId={payroll.id}
                    employeeLabel={employeeLabel}
                    period={period}
                    netSalary={payroll.net_salary}
                    onClose={() => setShowPay(false)}
                    onSuccess={() => {
                        setShowPay(false)
                        void load()
                    }}
                />
            )}

            {showRemarks && (
                <PayrollRemarksEdit
                    payrollId={payroll.id}
                    onClose={() => setShowRemarks(false)}
                    onSuccess={() => {
                        setShowRemarks(false)
                        void load()
                    }}
                />
            )}

        </div>
    )
}

export default PayrollDetail
