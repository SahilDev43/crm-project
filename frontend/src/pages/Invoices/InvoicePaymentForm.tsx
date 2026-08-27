import { useState } from 'react'
import type { FormEvent } from 'react'
import { X } from 'lucide-react'

import { addInvoicePayment } from '../../api/invoices'

interface InvoicePaymentFormProps {
    invoiceId: number
    onClose: () => void
    onSuccess: () => void | Promise<void>
}

function InvoicePaymentForm({
    invoiceId,
    onClose,
    onSuccess,
}: InvoicePaymentFormProps) {
    const [paymentDate, setPaymentDate] = useState(
        new Date().toISOString().split('T')[0]
    )

    const [amount, setAmount] = useState('')
    const [paymentMethod, setPaymentMethod] = useState('')
    const [transactionReference, setTransactionReference] = useState('')
    const [remarks, setRemarks] = useState('')

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault()

        setError('')

        if (!paymentDate) {
            setError('Payment date is required.')
            return
        }

        if (!amount || Number(amount) <= 0) {
            setError('Enter a valid payment amount.')
            return
        }

        if (!paymentMethod.trim()) {
            setError('Payment method is required.')
            return
        }

        try {
            setLoading(true)

            await addInvoicePayment(invoiceId, {
                payment_date: paymentDate,
                amount,
                payment_method: paymentMethod.trim(),
                transaction_reference:
                    transactionReference.trim() || null,
                remarks: remarks.trim() || null,
            })

            await onSuccess()
        } catch (error: any) {
            setError(
                error.response?.data?.detail ||
                'Unable to add payment.'
            )
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">

            <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">

                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">

                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                            Add Payment
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Record a payment for this invoice.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    >
                        <X size={20} />
                    </button>

                </div>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-5 p-6"
                >

                    {error && (
                        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-700">
                            Payment Date
                        </label>

                        <input
                            type="date"
                            value={paymentDate}
                            onChange={(event) =>
                                setPaymentDate(event.target.value)
                            }
                            disabled={loading}
                            className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700">
                            Amount
                        </label>

                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={amount}
                            onChange={(event) =>
                                setAmount(event.target.value)
                            }
                            placeholder="Enter payment amount"
                            disabled={loading}
                            className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700">
                            Payment Method
                        </label>

                        <select
                            value={paymentMethod}
                            onChange={(event) =>
                                setPaymentMethod(event.target.value)
                            }
                            disabled={loading}
                            className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        >
                            <option value="">
                                Select payment method
                            </option>
                            <option value="Cash">
                                Cash
                            </option>
                            <option value="Bank Transfer">
                                Bank Transfer
                            </option>
                            <option value="UPI">
                                UPI
                            </option>
                            <option value="Credit Card">
                                Credit Card
                            </option>
                            <option value="Debit Card">
                                Debit Card
                            </option>
                            <option value="Cheque">
                                Cheque
                            </option>
                            <option value="Other">
                                Other
                            </option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700">
                            Transaction Reference
                        </label>

                        <input
                            type="text"
                            value={transactionReference}
                            onChange={(event) =>
                                setTransactionReference(
                                    event.target.value
                                )
                            }
                            placeholder="Optional"
                            disabled={loading}
                            className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700">
                            Remarks
                        </label>

                        <textarea
                            rows={3}
                            value={remarks}
                            onChange={(event) =>
                                setRemarks(event.target.value)
                            }
                            placeholder="Optional remarks"
                            disabled={loading}
                            className="mt-1.5 w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                    </div>

                    <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">

                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {loading
                                ? 'Adding...'
                                : 'Add Payment'}
                        </button>

                    </div>

                </form>

            </div>

        </div>
    )
}

export default InvoicePaymentForm