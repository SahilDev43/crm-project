import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, X } from 'lucide-react'

import { processPayroll } from '../../api/payrolls'
import { getUsers } from '../../api/users'
import { getApiErrorMessage } from '../../api/errors'
import {
    MONTHS,
    employeeName,
    formatCurrency,
    monthName,
} from '../../lib/payroll'
import type { Payroll } from '../../types/payroll'
import type { User } from '../../types/user'

interface ProcessPayrollFormProps {
    onClose: () => void
    /** Called after a payroll is generated so the list can refresh. */
    onSuccess: () => void
}

const currentYear = new Date().getFullYear()
const YEARS = Array.from({ length: 7 }, (_, index) => currentYear - 4 + index)

const inputClass =
    'w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-red-500'

function ProcessPayrollForm({
    onClose,
    onSuccess,
}: ProcessPayrollFormProps) {
    const navigate = useNavigate()

    const [users, setUsers] = useState<User[]>([])

    const [userId, setUserId] = useState('')
    const [month, setMonth] = useState<number>(new Date().getMonth() + 1)
    const [year, setYear] = useState<number>(currentYear)

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [result, setResult] = useState<Payroll | null>(null)

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

    const handleSubmit = async (
        event: React.FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault()

        setError('')

        if (!userId) {
            setError('Select an employee.')
            return
        }

        if (!Number.isInteger(month) || month < 1 || month > 12) {
            setError('Select a valid month.')
            return
        }

        if (!Number.isInteger(year) || year < 2000 || year > 2100) {
            setError('Select a valid year.')
            return
        }

        try {
            setLoading(true)

            const payroll = await processPayroll({
                user_id: Number(userId),
                payroll_month: month,
                payroll_year: year,
            })

            setResult(payroll)
            onSuccess()
        } catch (err: unknown) {
            setError(
                getApiErrorMessage(
                    err,
                    'Unable to process payroll.',
                ),
            )
        } finally {
            setLoading(false)
        }
    }

    const selectedUser = users.find(
        (user) => String(user.id) === userId,
    )

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

            <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">

                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">

                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                            Process Payroll
                        </h2>

                        <p className="mt-1 text-xs text-slate-500">
                            The backend calculates all salary amounts.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    >
                        <X size={18} />
                    </button>

                </div>

                {result ? (
                    <div className="p-6">

                        <div className="flex items-center gap-3 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                            <CheckCircle2 size={18} />
                            Payroll generated for{' '}
                            {employeeName(selectedUser, result.user_id)} —{' '}
                            {monthName(result.payroll_month)}{' '}
                            {result.payroll_year}.
                        </div>

                        <dl className="mt-5 divide-y divide-slate-100 rounded-lg border border-slate-200">
                            <div className="flex justify-between px-4 py-2.5 text-sm">
                                <dt className="text-slate-500">Basic Salary</dt>
                                <dd className="font-medium text-slate-800">
                                    {formatCurrency(result.basic_salary)}
                                </dd>
                            </div>
                            <div className="flex justify-between px-4 py-2.5 text-sm">
                                <dt className="text-slate-500">Gross Salary</dt>
                                <dd className="font-medium text-slate-800">
                                    {formatCurrency(result.gross_salary)}
                                </dd>
                            </div>
                            <div className="flex justify-between px-4 py-2.5 text-sm">
                                <dt className="text-slate-500">
                                    Total Deductions
                                </dt>
                                <dd className="font-medium text-slate-800">
                                    {formatCurrency(result.total_deductions)}
                                </dd>
                            </div>
                            <div className="flex justify-between px-4 py-2.5 text-sm">
                                <dt className="font-medium text-slate-700">
                                    Net Salary
                                </dt>
                                <dd className="font-semibold text-slate-900">
                                    {formatCurrency(result.net_salary)}
                                </dd>
                            </div>
                        </dl>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                            >
                                Close
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    navigate(`/payroll/${result.id}`)
                                }
                                className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700"
                            >
                                View Details
                            </button>
                        </div>

                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>

                        <div className="space-y-4 p-6">

                            {error && (
                                <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                    Employee *
                                </label>

                                <select
                                    value={userId}
                                    onChange={(event) =>
                                        setUserId(event.target.value)
                                    }
                                    className={inputClass}
                                >
                                    <option value="">
                                        Select an employee
                                    </option>

                                    {users.map((user) => (
                                        <option key={user.id} value={user.id}>
                                            {employeeName(user, user.id)} (
                                            {user.email})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Month *
                                    </label>

                                    <select
                                        value={month}
                                        onChange={(event) =>
                                            setMonth(
                                                Number(event.target.value),
                                            )
                                        }
                                        className={inputClass}
                                    >
                                        {MONTHS.map((option) => (
                                            <option
                                                key={option.value}
                                                value={option.value}
                                            >
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Year *
                                    </label>

                                    <select
                                        value={year}
                                        onChange={(event) =>
                                            setYear(
                                                Number(event.target.value),
                                            )
                                        }
                                        className={inputClass}
                                    >
                                        {YEARS.map((option) => (
                                            <option key={option} value={option}>
                                                {option}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <p className="text-xs text-slate-400">
                                Basic salary, gross salary, components,
                                deductions and net salary are computed by the
                                backend from the employee&apos;s salary
                                structure.
                            </p>

                        </div>

                        <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">

                            <button
                                type="button"
                                onClick={onClose}
                                disabled={loading}
                                className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={loading}
                                className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {loading ? 'Processing...' : 'Process Payroll'}
                            </button>

                        </div>

                    </form>
                )}

            </div>

        </div>
    )
}

export default ProcessPayrollForm
