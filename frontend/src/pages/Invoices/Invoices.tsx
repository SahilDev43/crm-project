import { useEffect, useState } from 'react'
import {
    Eye,
    Pencil,
    Trash2,
    FileDown,
    Send,
    XCircle,
    Plus,
} from 'lucide-react'

import {
    getInvoices,
    getInvoicePdf,
    issueInvoice,
    getInvoiceErrorMessage,
} from '../../api/invoices'

import type { Invoice } from '../../types/invoice'
import InvoiceView from './InvoiceView'
import InvoiceCreate from './InvoiceCreate'
import InvoiceEdit from './InvoiceEdit'
import InvoiceDelete from './InvoiceDelete'
import InvoiceCancel from './InvoiceCancel'

function Invoices() {
    const [invoices, setInvoices] = useState<Invoice[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [ViewInvoiceId, setViewInvoiceId] = useState<number | null>(null)
    const [showCreate, setShowCreate] = useState(false)
    const [editInvoiceId, setEditInvoiceId] = useState<number | null>(null)
    const [deleteInvoiceData, setDeleteInvoiceData] = useState<Invoice | null>(null)
    const [cancelInvoiceData, setCancelInvoiceData] = useState<Invoice | null>(null)

    const loadInvoices = async () => {
        try {
            setLoading(true)
            setError('')

            const response = await getInvoices(page, 20)

            setInvoices(response.items)
            setTotalPages(response.total_pages)
        } catch (error: unknown) {
            setError(getInvoiceErrorMessage(error, 'Unable to load invoices.'))
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        // Loading a new server page is the purpose of this effect.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        void loadInvoices()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page])

    const handleDownloadPdf = async (
        invoiceId: number,
        invoiceNumber: string
    ) => {
        try {
            const blob = await getInvoicePdf(invoiceId)

            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')

            link.href = url
            link.download = `${invoiceNumber}.pdf`

            document.body.appendChild(link)
            link.click()

            link.remove()
            window.URL.revokeObjectURL(url)
        } catch (error) {
            console.error(error)
            setError('Unable to download invoice PDF.')
        }
    }

    const handleIssue = async (invoiceId: number) => {
        if (!window.confirm('Are you sure you want to issue this invoice?')) {
            return
        }

        try {
            await issueInvoice(invoiceId)
            await loadInvoices()
        } catch (error: unknown) {
            setError(getInvoiceErrorMessage(error, 'Unable to issue invoice.'))
        }
    }

    const handleCancel = async () => {
        try {
            setCancelInvoiceData(null)
            await loadInvoices()
        } catch (error: unknown) {
            setError(getInvoiceErrorMessage(error, 'Unable to cancel invoice.'))
        }
    }

    const handleDelete = async () => {
        try {
            setDeleteInvoiceData(null)
            await loadInvoices()
        } catch (error: unknown) {
            setError(getInvoiceErrorMessage(error, 'Unable to refresh invoices.'))
        }
    }

    const getStatusLabel = (status: number) => {
        switch (status) {
            case 1:
                return 'Draft'
            case 2:
                return 'Issued'
            case 3:
                return 'Partially Paid'
            case 4:
                return 'Paid'
            case 5:
                return 'Overdue'
            case 6:
                return 'Cancelled'
            case 7:
                return 'Void'
            default:
                return 'Unknown'
        }
    }

    const getStatusClass = (status: number) => {
        switch (status) {
            case 1:
                return 'bg-slate-100 text-slate-700'
            case 2:
                return 'bg-red-50 text-red-700'
            case 3:
                return 'bg-yellow-50 text-yellow-700'
            case 4:
                return 'bg-green-50 text-green-700'
            case 5:
                return 'bg-orange-50 text-orange-700'
            case 6:
            case 7:
                return 'bg-red-50 text-red-700'
            default:
                return 'bg-slate-100 text-slate-700'
        }
    }

    return (
        <div className="p-6">

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        Invoices
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Manage invoices and payments.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => setShowCreate(true)}
                    className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700"
                >
                    <Plus size={16} />
                    Create Invoice
                </button>
            </div>

            {error && (
                <div className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                </div>
            )}

            <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">

                {loading ? (
                    <div className="p-8 text-center text-sm text-slate-500">
                        Loading invoices...
                    </div>
                ) : invoices.length === 0 ? (
                    <div className="p-8 text-center text-sm text-slate-500">
                        No invoices found.
                    </div>
                ) : (
                    <div className="overflow-x-auto">

                        <table className="w-full text-left">

                            <thead className="border-b border-slate-200 bg-slate-50">
                                <tr>

                                    <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500">
                                        Invoice
                                    </th>

                                    <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500">
                                        Customer
                                    </th>

                                    <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500">
                                        Company
                                    </th>

                                    <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500">
                                        Invoice Date
                                    </th>

                                    <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500">
                                        Due Date
                                    </th>

                                    <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500">
                                        Total
                                    </th>

                                    <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500">
                                        Status
                                    </th>

                                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-slate-500">
                                        Actions
                                    </th>

                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">

                                {invoices.map((invoice) => (
                                    <tr
                                        key={invoice.id}
                                        className="hover:bg-slate-50"
                                    >

                                        <td className="px-6 py-4">
                                            <p className="font-medium text-slate-900">
                                                {invoice.invoice_number}
                                            </p>

                                            <p className="mt-1 text-xs text-slate-400">
                                                #{invoice.id}
                                            </p>
                                        </td>

                                        <td className="px-6 py-4">
                                            <p className="text-sm font-medium text-slate-700">
                                                {invoice.customer_name}
                                            </p>

                                            {invoice.customer_email && (
                                                <p className="mt-1 text-xs text-slate-400">
                                                    {invoice.customer_email}
                                                </p>
                                            )}
                                        </td>

                                        <td className="px-6 py-4 text-sm text-slate-700">
                                            {invoice.company_name}
                                        </td>

                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {invoice.invoice_date}
                                        </td>

                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {invoice.due_date || '—'}
                                        </td>

                                        <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                                            {invoice.grand_total}
                                        </td>

                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClass(invoice.status)}`}
                                            >
                                                {getStatusLabel(invoice.status)}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4">

                                            <div className="flex justify-end gap-1">

                                                <button
                                                    type="button"
                                                    title="View"
                                                    onClick={() => setViewInvoiceId(invoice.id)}
                                                    className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                                                >
                                                    <Eye size={16} />
                                                </button>

                                                {invoice.status === 1 && (
                                                    <button
                                                        type="button"
                                                        title="Issue"
                                                        onClick={() =>
                                                            handleIssue(invoice.id)
                                                        }
                                                        className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
                                                    >
                                                        <Send size={16} />
                                                    </button>
                                                )}

                                                {invoice.status !== 6 &&
                                                    invoice.status !== 7 && (
                                                        <button
                                                            type="button"
                                                            title="Cancel"
                                                            onClick={() => setCancelInvoiceData(invoice)}
                                                            className="rounded-lg p-2 text-slate-500 hover:bg-orange-50 hover:text-orange-600"
                                                        >
                                                            <XCircle size={16} />
                                                        </button>
                                                    )}

                                                {invoice.status === 1 && (
                                                    <button
                                                        type="button"
                                                        title="Edit"
                                                        onClick={() => setEditInvoiceId(invoice.id)}
                                                        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                                                    >
                                                        <Pencil size={16} />
                                                    </button>
                                                )}

                                                <button
                                                    type="button"
                                                    title="Download PDF"
                                                    onClick={() =>
                                                        handleDownloadPdf(
                                                            invoice.id,
                                                            invoice.invoice_number
                                                        )
                                                    }
                                                    className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                                                >
                                                    <FileDown size={16} />
                                                </button>

                                                <button
                                                    type="button"
                                                    title="Delete"
                                                    onClick={() => setDeleteInvoiceData(invoice)}
                                                    className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                                                >
                                                    <Trash2 size={16} />
                                                </button>

                                            </div>

                                        </td>

                                    </tr>
                                ))}

                            </tbody>

                        </table>

                    </div>
                )}

            </div>

            {totalPages > 1 && (
                <div className="mt-5 flex items-center justify-between">

                    <button
                        type="button"
                        disabled={page === 1}
                        onClick={() =>
                            setPage((current) => current - 1)
                        }
                        className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        Previous
                    </button>

                    <span className="text-sm text-slate-500">
                        Page {page} of {totalPages}
                    </span>

                    <button
                        type="button"
                        disabled={page === totalPages}
                        onClick={() =>
                            setPage((current) => current + 1)
                        }
                        className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        Next
                    </button>

                </div>
            )}

            {ViewInvoiceId !== null && (
                <InvoiceView
                    invoiceId={ViewInvoiceId}
                    onClose={() => setViewInvoiceId(null)}
                />
            )}

            {showCreate && (
                <InvoiceCreate
                    onClose={() => setShowCreate(false)}
                    onSuccess={async () => {
                        setShowCreate(false)
                        await loadInvoices()
                    }}
                />
            )}

            {editInvoiceId !== null && (
                (() => {
                    const invoice = invoices.find(
                        (item) => item.id === editInvoiceId
                    )

                    if (!invoice) {
                        return null
                    }

                    return (
                        <InvoiceEdit
                            invoice={invoice}
                            onClose={() => setEditInvoiceId(null)}
                            onSuccess={async () => {
                                setEditInvoiceId(null)
                                await loadInvoices()
                            }}
                        />
                    )
                })()
            )}

            {deleteInvoiceData && (
                <InvoiceDelete
                    invoiceId={deleteInvoiceData.id}
                    invoiceNumber={deleteInvoiceData.invoice_number}
                    onClose={() => setDeleteInvoiceData(null)}
                    onSuccess={handleDelete}
                />
            )}

            {cancelInvoiceData && (
                <InvoiceCancel
                    invoiceId={cancelInvoiceData.id}
                    invoiceNumber={cancelInvoiceData.invoice_number}
                    onClose={() => setCancelInvoiceData(null)}
                    onSuccess={handleCancel}
                />
            )}

        </div>
    )
}

export default Invoices
