import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    BadgeCheck,
    ChevronLeft,
    ChevronRight,
    Eye,
    Loader2,
    MessageSquare,
    Play,
} from 'lucide-react'

import { getPayrolls } from '../../api/payrolls'
import { getUsers } from '../../api/users'
import { getApiErrorMessage } from '../../api/errors'
import { useAuth } from '../../auth/AuthContext'
import {
    MONTHS,
    PAYROLL_STATUS,
    PAYROLL_STATUS_OPTIONS,
    employeeName,
    formatCurrency,
    formatDate,
    monthName,
    payrollStatusBadge,
    payrollStatusLabel,
} from '../../lib/payroll'
import type { Payroll as PayrollRecord } from '../../types/payroll'
import type { User } from '../../types/user'
import ProcessPayrollForm from './ProcessPayrollForm'
import PayrollPayModal from './PayrollPayModal'
import PayrollRemarksEdit from './PayrollRemarksEdit'

const PAGE_SIZE = 10

const currentYear = new Date().getFullYear()
const YEARS = Array.from({ length: 7 }, (_, index) => currentYear - 4 + index)

function Payroll() {
    const navigate = useNavigate()
    const { hasPermission } = useAuth()

    const canProcess = hasPermission('payroll.process')
    const canPay = hasPermission('payroll.pay')
    const canUpdate = hasPermission('payroll.update')

    const [payrolls, setPayrolls] = useState<PayrollRecord[]>([])
    const [users, setUsers] = useState<User[]>([])

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const [userFilter, setUserFilter] = useState('')
    const [monthFilter, setMonthFilter] = useState('')
    const [yearFilter, setYearFilter] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [page, setPage] = useState(1)
    const [total, setTotal] = useState(0)
    const [totalPages, setTotalPages] = useState(0)

    const [showProcess, setShowProcess] = useState(false)
    const [payTarget, setPayTarget] = useState<PayrollRecord | null>(null)
    const [remarksTargetId, setRemarksTargetId] = useState<number | null>(null)

    const usersById = useMemo(() => {
        const map = new Map<number, User>()

        for (const user of users) {
            map.set(user.id, user)
        }

        return map
    }, [users])

    useEffect(() => {
        let active = true

        getUsers({ page: 1, page_size: 100 })
            .then((data) => {
                if (active) {
                    setUsers(data.items)
                }
            })
            .catch(() => {
                if (active) {
                    setUsers([])
                }
            })

        return () => {
            active = false
        }
    }, [])

    const loadPayrolls = async () => {
        try {
            setLoading(true)
            setError('')

            const data = await getPayrolls({
                user_id: userFilter ? Number(userFilter) : undefined,
                payroll_month: monthFilter ? Number(monthFilter) : undefined,
                payroll_year: yearFilter ? Number(yearFilter) : undefined,
                status: statusFilter ? Number(statusFilter) : undefined,
                page,
                page_size: PAGE_SIZE,
            })

            if (
                data.items.length === 0 &&
                page > 1 &&
                data.total_pages > 0
            ) {
                setPage(data.total_pages)
                return
            }

            setPayrolls(data.items)
            setTotal(data.total)
            setTotalPages(data.total_pages)
        } catch (err: unknown) {
            setPayrolls([])
            setError(
                getApiErrorMessage(err, 'Unable to load payrolls.'),
            )
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        void loadPayrolls()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userFilter, monthFilter, yearFilter, statusFilter, page])

    const labelFor = (payroll: PayrollRecord) =>
        employeeName(usersById.get(payroll.user_id), payroll.user_id)

    const selectClass =
        'rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-red-500'

    return (
        <div className="p-6">

            <div className="flex items-center justify-between">

                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        Payroll
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Generated payroll runs. All amounts are calculated by the
                        backend.
                    </p>
                </div>

                {canProcess && (
                    <button
                        type="button"
                        onClick={() => setShowProcess(true)}
                        className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700"
                    >
                        <Play size={16} />
                        Process Payroll
                    </button>
                )}

            </div>

            {error && (
                <div className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                </div>
            )}

            <div className="mt-6 flex flex-wrap items-end gap-3">

                <select
                    value={userFilter}
                    onChange={(event) => {
                        setUserFilter(event.target.value)
                        setPage(1)
                    }}
                    className={`min-w-[13rem] ${selectClass}`}
                >
                    <option value="">All employees</option>

                    {users.map((user) => (
                        <option key={user.id} value={user.id}>
                            {employeeName(user, user.id)}
                        </option>
                    ))}
                </select>

                <select
                    value={monthFilter}
                    onChange={(event) => {
                        setMonthFilter(event.target.value)
                        setPage(1)
                    }}
                    className={selectClass}
                >
                    <option value="">All months</option>

                    {MONTHS.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>

                <select
                    value={yearFilter}
                    onChange={(event) => {
                        setYearFilter(event.target.value)
                        setPage(1)
                    }}
                    className={selectClass}
                >
                    <option value="">All years</option>

                    {YEARS.map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </select>

                <select
                    value={statusFilter}
                    onChange={(event) => {
                        setStatusFilter(event.target.value)
                        setPage(1)
                    }}
                    className={selectClass}
                >
                    <option value="">All statuses</option>

                    {PAYROLL_STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>

            </div>

            <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">

                {loading ? (
                    <div className="flex items-center justify-center gap-2 p-8 text-sm text-slate-500">
                        <Loader2 size={16} className="animate-spin" />
                        Loading payrolls...
                    </div>
                ) : payrolls.length === 0 ? (
                    <div className="p-8 text-center text-sm text-slate-500">
                        {userFilter ||
                        monthFilter ||
                        yearFilter ||
                        statusFilter
                            ? 'No payrolls match the current filters.'
                            : 'No payrolls have been processed yet.'}
                    </div>
                ) : (
                    <div className="overflow-x-auto">

                        <table className="w-full text-left">

                            <thead className="border-b border-slate-200 bg-slate-50">
                                <tr>
                                    <th className="px-5 py-3 text-xs font-semibold uppercase text-slate-500">
                                        Employee
                                    </th>
                                    <th className="px-5 py-3 text-xs font-semibold uppercase text-slate-500">
                                        Month
                                    </th>
                                    <th className="px-5 py-3 text-xs font-semibold uppercase text-slate-500">
                                        Year
                                    </th>
                                    <th className="px-5 py-3 text-xs font-semibold uppercase text-slate-500">
                                        Basic
                                    </th>
                                    <th className="px-5 py-3 text-xs font-semibold uppercase text-slate-500">
                                        Gross
                                    </th>
                                    <th className="px-5 py-3 text-xs font-semibold uppercase text-slate-500">
                                        Deductions
                                    </th>
                                    <th className="px-5 py-3 text-xs font-semibold uppercase text-slate-500">
                                        Net
                                    </th>
                                    <th className="px-5 py-3 text-xs font-semibold uppercase text-slate-500">
                                        Status
                                    </th>
                                    <th className="px-5 py-3 text-xs font-semibold uppercase text-slate-500">
                                        Paid Date
                                    </th>
                                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-slate-500">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">

                                {payrolls.map((payroll) => {
                                    const isPaid =
                                        payroll.status === PAYROLL_STATUS.PAID

                                    return (
                                        <tr
                                            key={payroll.id}
                                            className="hover:bg-slate-50"
                                        >

                                            <td className="px-5 py-4">
                                                <div className="font-medium text-slate-900">
                                                    {labelFor(payroll)}
                                                </div>
                                                <div className="mt-1 text-xs text-slate-400">
                                                    Payroll #{payroll.id}
                                                </div>
                                            </td>

                                            <td className="px-5 py-4 text-sm text-slate-600">
                                                {monthName(
                                                    payroll.payroll_month,
                                                )}
                                            </td>

                                            <td className="px-5 py-4 text-sm text-slate-600">
                                                {payroll.payroll_year}
                                            </td>

                                            <td className="px-5 py-4 text-sm text-slate-600">
                                                {formatCurrency(
                                                    payroll.basic_salary,
                                                )}
                                            </td>

                                            <td className="px-5 py-4 text-sm text-slate-600">
                                                {formatCurrency(
                                                    payroll.gross_salary,
                                                )}
                                            </td>

                                            <td className="px-5 py-4 text-sm text-slate-600">
                                                {formatCurrency(
                                                    payroll.total_deductions,
                                                )}
                                            </td>

                                            <td className="px-5 py-4 text-sm font-semibold text-slate-900">
                                                {formatCurrency(
                                                    payroll.net_salary,
                                                )}
                                            </td>

                                            <td className="px-5 py-4">
                                                <span
                                                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${payrollStatusBadge(
                                                        payroll.status,
                                                    )}`}
                                                >
                                                    {payrollStatusLabel(
                                                        payroll.status,
                                                    )}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4 text-sm text-slate-600">
                                                {payroll.paid_at
                                                    ? formatDate(
                                                          payroll.paid_at,
                                                      )
                                                    : '—'}
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="flex justify-end gap-1">

                                                    <button
                                                        type="button"
                                                        title="View details"
                                                        onClick={() =>
                                                            navigate(
                                                                `/payroll/${payroll.id}`,
                                                            )
                                                        }
                                                        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                                                    >
                                                        <Eye size={16} />
                                                    </button>

                                                    {canUpdate && (
                                                        <button
                                                            type="button"
                                                            title="Edit remarks"
                                                            onClick={() =>
                                                                setRemarksTargetId(
                                                                    payroll.id,
                                                                )
                                                            }
                                                            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                                                        >
                                                            <MessageSquare
                                                                size={16}
                                                            />
                                                        </button>
                                                    )}

                                                    {canPay && !isPaid && (
                                                        <button
                                                            type="button"
                                                            title="Mark as paid"
                                                            onClick={() =>
                                                                setPayTarget(
                                                                    payroll,
                                                                )
                                                            }
                                                            className="rounded-lg p-2 text-emerald-600 hover:bg-emerald-50"
                                                        >
                                                            <BadgeCheck
                                                                size={16}
                                                            />
                                                        </button>
                                                    )}

                                                </div>
                                            </td>

                                        </tr>
                                    )
                                })}

                            </tbody>

                        </table>

                    </div>
                )}

            </div>

            {!loading && totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">

                    <p className="text-sm text-slate-500">
                        Showing{' '}
                        <span className="font-medium text-slate-700">
                            {(page - 1) * PAGE_SIZE + 1}
                        </span>
                        {'–'}
                        <span className="font-medium text-slate-700">
                            {Math.min(page * PAGE_SIZE, total)}
                        </span>
                        {' of '}
                        <span className="font-medium text-slate-700">
                            {total}
                        </span>
                    </p>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() =>
                                setPage((value) => Math.max(1, value - 1))
                            }
                            disabled={page <= 1}
                            className="flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <ChevronLeft size={16} />
                            Prev
                        </button>

                        <span className="text-sm text-slate-500">
                            Page {page} of {totalPages}
                        </span>

                        <button
                            type="button"
                            onClick={() =>
                                setPage((value) =>
                                    Math.min(totalPages, value + 1),
                                )
                            }
                            disabled={page >= totalPages}
                            className="flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Next
                            <ChevronRight size={16} />
                        </button>
                    </div>

                </div>
            )}

            {showProcess && (
                <ProcessPayrollForm
                    onClose={() => setShowProcess(false)}
                    onSuccess={() => {
                        void loadPayrolls()
                    }}
                />
            )}

            {payTarget && (
                <PayrollPayModal
                    payrollId={payTarget.id}
                    employeeLabel={labelFor(payTarget)}
                    period={`${monthName(payTarget.payroll_month)} ${payTarget.payroll_year}`}
                    netSalary={payTarget.net_salary}
                    onClose={() => setPayTarget(null)}
                    onSuccess={() => {
                        setPayTarget(null)
                        void loadPayrolls()
                    }}
                />
            )}

            {remarksTargetId !== null && (
                <PayrollRemarksEdit
                    payrollId={remarksTargetId}
                    onClose={() => setRemarksTargetId(null)}
                    onSuccess={() => {
                        setRemarksTargetId(null)
                        void loadPayrolls()
                    }}
                />
            )}

        </div>
    )
}

export default Payroll
