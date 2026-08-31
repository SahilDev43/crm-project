import { useState } from 'react'
import { BadgeCheck, X } from 'lucide-react'

import { markPayrollAsPaid } from '../../api/payrolls'
import { getApiErrorMessage } from '../../api/errors'
import { formatCurrency } from '../../lib/payroll'

interface PayrollPayModalProps {
    payrollId: number
    employeeLabel: string
    period: string
    netSalary: string
    onClose: () => void
    onSuccess: () => void
}

function PayrollPayModal({
    payrollId,
    employeeLabel,
    period,
    netSalary,
    onClose,
    onSuccess,
}: PayrollPayModalProps) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleConfirm = async () => {
        try {
            setLoading(true)
            setError('')

            await markPayrollAsPaid(payrollId)

            onSuccess()
        } catch (err: unknown) {
            setError(
                getApiErrorMessage(
                    err,
                    'Unable to mark payroll as paid.',
                ),
            )
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

            <div className="w-full max-w-md rounded-xl bg-white shadow-xl">

                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">

                    <h2 className="text-lg font-semibold text-slate-900">
                        Mark Payroll as Paid
                    </h2>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                    >
                        <X size={18} />
                    </button>

                </div>

                <div className="p-6">

                    <div className="flex gap-4">

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                            <BadgeCheck size={21} />
                        </div>

                        <div>
                            <h3 className="font-medium text-slate-900">
                                Confirm payment
                            </h3>

                            <p className="mt-1 text-sm leading-6 text-slate-600">
                                This records the payroll as paid. The paid date
                                is set by the backend and cannot be undone here.
                            </p>
                        </div>

                    </div>

                    <dl className="mt-5 divide-y divide-slate-100 rounded-lg border border-slate-200">
                        <div className="flex justify-between px-4 py-2.5 text-sm">
                            <dt className="text-slate-500">Employee</dt>
                            <dd className="font-medium text-slate-800">
                                {employeeLabel}
                            </dd>
                        </div>
                        <div className="flex justify-between px-4 py-2.5 text-sm">
                            <dt className="text-slate-500">Period</dt>
                            <dd className="font-medium text-slate-800">
                                {period}
                            </dd>
                        </div>
                        <div className="flex justify-between px-4 py-2.5 text-sm">
                            <dt className="text-slate-500">Net Salary</dt>
                            <dd className="font-semibold text-slate-900">
                                {formatCurrency(netSalary)}
                            </dd>
                        </div>
                    </dl>

                    {error && (
                        <div className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                            {error}
                        </div>
                    )}

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
                        type="button"
                        onClick={handleConfirm}
                        disabled={loading}
                        className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : 'Mark as Paid'}
                    </button>

                </div>

            </div>

        </div>
    )
}

export default PayrollPayModal
