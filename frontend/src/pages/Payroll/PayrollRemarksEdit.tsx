import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

import { getPayroll, updatePayroll } from '../../api/payrolls'
import { getApiErrorMessage } from '../../api/errors'

interface PayrollRemarksEditProps {
    payrollId: number
    onClose: () => void
    onSuccess: () => void
}

function PayrollRemarksEdit({
    payrollId,
    onClose,
    onSuccess,
}: PayrollRemarksEditProps) {
    const [remarks, setRemarks] = useState('')

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        const loadPayroll = async () => {
            try {
                setLoading(true)
                setError('')

                const payroll = await getPayroll(payrollId)

                setRemarks(payroll.remarks ?? '')
            } catch (err: unknown) {
                setError(
                    getApiErrorMessage(err, 'Unable to load payroll.'),
                )
            } finally {
                setLoading(false)
            }
        }

        void loadPayroll()
    }, [payrollId])

    const handleSubmit = async (
        event: React.FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault()

        setError('')

        try {
            setSaving(true)

            await updatePayroll(payrollId, {
                remarks: remarks.trim() || null,
            })

            onSuccess()
        } catch (err: unknown) {
            setError(
                getApiErrorMessage(
                    err,
                    'Unable to update payroll remarks.',
                ),
            )
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

            <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">

                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">

                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                            Edit Payroll Remarks
                        </h2>

                        <p className="mt-1 text-xs text-slate-500">
                            Only remarks can be edited — salary figures are
                            generated data.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving}
                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    >
                        <X size={18} />
                    </button>

                </div>

                <form onSubmit={handleSubmit}>

                    <div className="p-6">

                        {loading ? (
                            <div className="py-10 text-center text-sm text-slate-500">
                                Loading payroll...
                            </div>
                        ) : (
                            <div className="space-y-4">

                                {error && (
                                    <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                                        {error}
                                    </div>
                                )}

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Remarks
                                    </label>

                                    <textarea
                                        value={remarks}
                                        onChange={(event) =>
                                            setRemarks(event.target.value)
                                        }
                                        rows={4}
                                        className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-red-500"
                                        placeholder="Add a note about this payroll..."
                                    />
                                </div>

                            </div>
                        )}

                    </div>

                    <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">

                        <button
                            type="button"
                            onClick={onClose}
                            disabled={saving}
                            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading || saving}
                            className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Save Remarks'}
                        </button>

                    </div>

                </form>

            </div>

        </div>
    )
}

export default PayrollRemarksEdit
