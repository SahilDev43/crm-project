import { AlertTriangle, X } from 'lucide-react'
import { useState } from 'react'

import { cancelInvoice, getInvoiceErrorMessage } from '../../api/invoices'

interface InvoiceCancelProps {
    invoiceId: number
    invoiceNumber: string
    onClose: () => void
    onSuccess: () => void | Promise<void>
}

function InvoiceCancel({
    invoiceId,
    invoiceNumber,
    onClose,
    onSuccess,
}: InvoiceCancelProps) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleCancel = async () => {
        try {
            setLoading(true)
            setError('')
            await cancelInvoice(invoiceId)
            await onSuccess()
        } catch (error: unknown) {
            setError(getInvoiceErrorMessage(error, 'Unable to cancel invoice.'))
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                    <h2 className="text-lg font-semibold text-slate-900">
                        Cancel Invoice
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
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange-50 text-orange-600">
                            <AlertTriangle size={21} />
                        </div>
                        <div>
                            <h3 className="font-medium text-slate-900">
                                Are you sure?
                            </h3>
                            <p className="mt-1 text-sm leading-6 text-slate-600">
                                You are about to cancel{' '}
                                <span className="font-semibold text-slate-900">
                                    {invoiceNumber}
                                </span>
                                . This action cannot be undone.
                            </p>
                        </div>
                    </div>
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
                        Keep Invoice
                    </button>
                    <button
                        type="button"
                        onClick={handleCancel}
                        disabled={loading}
                        className="rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-50"
                    >
                        {loading ? 'Cancelling...' : 'Cancel Invoice'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default InvoiceCancel
