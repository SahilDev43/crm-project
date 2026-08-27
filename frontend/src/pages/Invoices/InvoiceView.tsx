import { useEffect, useState } from 'react'
import {
    X,
    FileDown,
    Plus,
} from 'lucide-react'

import {
    getInvoice,
    getInvoicePayments,
    getInvoicePaymentSummary,
    getInvoicePdf,
} from '../../api/invoices'

import type {
    Invoice,
    InvoicePayment,
    InvoicePaymentSummary,
} from '../../types/invoice'

import InvoicePaymentForm from './InvoicePaymentForm'

interface InvoiceViewProps {
    invoiceId: number
    onClose: () => void
}

function InvoiceView({
    invoiceId,
    onClose,
}: InvoiceViewProps) {
    const [invoice, setInvoice] =
        useState<Invoice | null>(null)

    const [payments, setPayments] =
        useState<InvoicePayment[]>([])

    const [paymentSummary, setPaymentSummary] =
        useState<InvoicePaymentSummary | null>(null)

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [showPaymentForm, setShowPaymentForm] = useState(false)

    useEffect(() => {
        const loadInvoice = async () => {
            try {
                setLoading(true)
                setError('')

                const [
                    invoiceData,
                    paymentsData,
                    summaryData,
                ] = await Promise.all([
                    getInvoice(invoiceId),
                    getInvoicePayments(invoiceId),
                    getInvoicePaymentSummary(invoiceId),
                ])

                setInvoice(invoiceData)
                setPayments(paymentsData)
                setPaymentSummary(summaryData)
            } catch (error: any) {
                setError(
                    error.response?.data?.detail ||
                    'Unable to load invoice.'
                )
            } finally {
                setLoading(false)
            }
        }

        loadInvoice()
    }, [invoiceId])

    const handleDownloadPdf = async () => {
        if (!invoice) {
            return
        }

        try {
            const blob = await getInvoicePdf(invoice.id)

            const url =
                window.URL.createObjectURL(blob)

            const link =
                document.createElement('a')

            link.href = url
            link.download =
                `${invoice.invoice_number}.pdf`

            document.body.appendChild(link)
            link.click()

            link.remove()
            window.URL.revokeObjectURL(url)
        } catch (error) {
            setError(
                'Unable to download invoice PDF.'
            )
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

    if (loading) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                <div className="rounded-xl bg-white px-8 py-6 text-sm text-slate-500">
                    Loading invoice...
                </div>
            </div>
        )
    }

    if (!invoice) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                <div className="w-full max-w-md rounded-xl bg-white p-6">

                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-slate-900">
                            Invoice
                        </h2>

                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <p className="mt-5 text-sm text-red-600">
                        {error || 'Invoice not found.'}
                    </p>

                </div>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 p-4">

            <div className="mx-auto my-8 w-full max-w-6xl rounded-xl bg-white shadow-xl">

                {/* Header */}

                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">

                    <div>
                        <h2 className="text-xl font-bold text-slate-900">
                            {invoice.invoice_number}
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Invoice #{invoice.id}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">

                        <button
                            type="button"
                            onClick={handleDownloadPdf}
                            className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                        >
                            <FileDown size={16} />
                            PDF
                        </button>

                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                        >
                            <X size={20} />
                        </button>

                    </div>

                </div>

                <div className="p-6">

                    {error && (
                        <div className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    {/* Invoice information */}

                    <div className="grid gap-6 md:grid-cols-2">

                        <div className="rounded-xl border border-slate-200 p-5">

                            <h3 className="text-sm font-semibold uppercase text-slate-400">
                                From
                            </h3>

                            <div className="mt-3">

                                <p className="font-semibold text-slate-900">
                                    {invoice.company_name}
                                </p>

                                <p className="mt-1 text-sm text-slate-600">
                                    {invoice.company_address}
                                </p>

                                <p className="mt-1 text-sm text-slate-600">
                                    {invoice.company_state}
                                </p>

                                {invoice.company_gstin && (
                                    <p className="mt-2 text-sm text-slate-600">
                                        GSTIN: {invoice.company_gstin}
                                    </p>
                                )}

                            </div>

                        </div>

                        <div className="rounded-xl border border-slate-200 p-5">

                            <h3 className="text-sm font-semibold uppercase text-slate-400">
                                Bill To
                            </h3>

                            <div className="mt-3">

                                <p className="font-semibold text-slate-900">
                                    {invoice.customer_name}
                                </p>

                                {invoice.customer_company && (
                                    <p className="mt-1 text-sm text-slate-600">
                                        {invoice.customer_company}
                                    </p>
                                )}

                                {invoice.customer_email && (
                                    <p className="mt-1 text-sm text-slate-600">
                                        {invoice.customer_email}
                                    </p>
                                )}

                                {invoice.customer_phone && (
                                    <p className="mt-1 text-sm text-slate-600">
                                        {invoice.customer_phone}
                                    </p>
                                )}

                                {invoice.customer_address && (
                                    <p className="mt-2 text-sm text-slate-600">
                                        {invoice.customer_address}
                                    </p>
                                )}

                                {invoice.customer_gstin && (
                                    <p className="mt-2 text-sm text-slate-600">
                                        GSTIN: {invoice.customer_gstin}
                                    </p>
                                )}

                            </div>

                        </div>

                    </div>

                    {/* Dates / status */}

                    <div className="mt-6 grid gap-4 sm:grid-cols-3">

                        <div className="rounded-xl bg-slate-50 p-4">
                            <p className="text-xs font-medium uppercase text-slate-400">
                                Invoice Date
                            </p>

                            <p className="mt-1 text-sm font-medium text-slate-900">
                                {invoice.invoice_date}
                            </p>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-4">
                            <p className="text-xs font-medium uppercase text-slate-400">
                                Due Date
                            </p>

                            <p className="mt-1 text-sm font-medium text-slate-900">
                                {invoice.due_date || '—'}
                            </p>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-4">
                            <p className="text-xs font-medium uppercase text-slate-400">
                                Status
                            </p>

                            <p className="mt-1 text-sm font-semibold text-slate-900">
                                {getStatusLabel(invoice.status)}
                            </p>
                        </div>

                    </div>

                    {/* Items */}

                    <div className="mt-6">

                        <h3 className="mb-3 text-sm font-semibold text-slate-900">
                            Invoice Items
                        </h3>

                        <div className="overflow-hidden rounded-xl border border-slate-200">

                            <table className="w-full text-left">

                                <thead className="bg-slate-50">
                                    <tr>

                                        <th className="px-5 py-3 text-xs font-semibold uppercase text-slate-500">
                                            Description
                                        </th>

                                        <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-slate-500">
                                            Qty
                                        </th>

                                        <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-slate-500">
                                            Unit Price
                                        </th>

                                        <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-slate-500">
                                            Discount
                                        </th>

                                        <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-slate-500">
                                            GST
                                        </th>

                                        <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-slate-500">
                                            Total
                                        </th>

                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">

                                    {invoice.items.map((item) => (
                                        <tr key={item.id}>

                                            <td className="px-5 py-4 text-sm text-slate-700">
                                                {item.description}
                                            </td>

                                            <td className="px-5 py-4 text-right text-sm text-slate-600">
                                                {item.quantity}
                                            </td>

                                            <td className="px-5 py-4 text-right text-sm text-slate-600">
                                                {item.unit_price}
                                            </td>

                                            <td className="px-5 py-4 text-right text-sm text-slate-600">
                                                {item.discount}
                                            </td>

                                            <td className="px-5 py-4 text-right text-sm text-slate-600">
                                                {item.gst_rate}%
                                            </td>

                                            <td className="px-5 py-4 text-right text-sm font-medium text-slate-900">
                                                {item.total}
                                            </td>

                                        </tr>
                                    ))}

                                </tbody>

                            </table>

                        </div>

                    </div>

                    {/* Totals */}

                    <div className="mt-6 flex justify-end">

                        <div className="w-full max-w-sm space-y-3">

                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">
                                    Subtotal
                                </span>

                                <span className="font-medium text-slate-900">
                                    {invoice.subtotal}
                                </span>
                            </div>

                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">
                                    Discount
                                </span>

                                <span className="font-medium text-slate-900">
                                    {invoice.discount}
                                </span>
                            </div>

                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">
                                    Tax
                                </span>

                                <span className="font-medium text-slate-900">
                                    {invoice.total_tax}
                                </span>
                            </div>

                            <div className="border-t border-slate-200 pt-3">

                                <div className="flex justify-between">

                                    <span className="font-semibold text-slate-900">
                                        Grand Total
                                    </span>

                                    <span className="text-lg font-bold text-slate-900">
                                        {invoice.grand_total}
                                    </span>

                                </div>

                            </div>

                        </div>

                    </div>

                    {/* Payment Summary */}

                    {paymentSummary && (
                        <div className="mt-8">

                            <h3 className="mb-3 text-sm font-semibold text-slate-900">
                                Payment Summary
                            </h3>

                            <div className="grid gap-4 sm:grid-cols-3">

                                <div className="rounded-xl border border-slate-200 p-4">
                                    <p className="text-xs uppercase text-slate-400">
                                        Invoice Total
                                    </p>

                                    <p className="mt-1 text-lg font-semibold text-slate-900">
                                        {paymentSummary.grand_total}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-slate-200 p-4">
                                    <p className="text-xs uppercase text-slate-400">
                                        Paid
                                    </p>

                                    <p className="mt-1 text-lg font-semibold text-green-600">
                                        {paymentSummary.total_paid}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-slate-200 p-4">
                                    <p className="text-xs uppercase text-slate-400">
                                        Remaining
                                    </p>

                                    <p className="mt-1 text-lg font-semibold text-orange-600">
                                        {paymentSummary.remaining_amount}
                                    </p>
                                </div>

                            </div>

                        </div>
                    )}

                    {/* Payments */}

                    <div className="mt-8">

                        <div className="mb-3 flex items-center justify-between">

                            <h3 className="text-sm font-semibold text-slate-900">
                                Payment History
                            </h3>

                            <button
                                type="button"
                                onClick={() => setShowPaymentForm(true)}
                                className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                            >
                                <Plus size={15} />
                                Add Payment
                            </button>

                        </div>

                        {payments.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
                                No payments recorded.
                            </div>
                        ) : (
                            <div className="overflow-hidden rounded-xl border border-slate-200">

                                <table className="w-full text-left">

                                    <thead className="bg-slate-50">
                                        <tr>

                                            <th className="px-5 py-3 text-xs font-semibold uppercase text-slate-500">
                                                Date
                                            </th>

                                            <th className="px-5 py-3 text-xs font-semibold uppercase text-slate-500">
                                                Method
                                            </th>

                                            <th className="px-5 py-3 text-xs font-semibold uppercase text-slate-500">
                                                Reference
                                            </th>

                                            <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-slate-500">
                                                Amount
                                            </th>

                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-slate-100">

                                        {payments.map((payment) => (
                                            <tr key={payment.id}>

                                                <td className="px-5 py-4 text-sm text-slate-600">
                                                    {payment.payment_date}
                                                </td>

                                                <td className="px-5 py-4 text-sm text-slate-700">
                                                    {payment.payment_method}
                                                </td>

                                                <td className="px-5 py-4 text-sm text-slate-600">
                                                    {payment.transaction_reference || '—'}
                                                </td>

                                                <td className="px-5 py-4 text-right text-sm font-medium text-slate-900">
                                                    {payment.amount}
                                                </td>

                                            </tr>
                                        ))}

                                    </tbody>

                                </table>

                            </div>
                        )}

                    </div>

                    {invoice.notes && (
                        <div className="mt-8 rounded-xl bg-slate-50 p-5">

                            <h3 className="text-sm font-semibold text-slate-900">
                                Notes
                            </h3>

                            <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">
                                {invoice.notes}
                            </p>

                        </div>
                    )}

                    {showPaymentForm && (
                        <InvoicePaymentForm
                            invoiceId={invoice.id}
                            onClose={() => setShowPaymentForm(false)}
                            onSuccess={async () => {
                                setShowPaymentForm(false)

                                const [
                                    invoiceData,
                                    paymentsData,
                                    summaryData,
                                ] = await Promise.all([
                                    getInvoice(invoice.id),
                                    getInvoicePayments(invoice.id),
                                    getInvoicePaymentSummary(invoice.id),
                                ])

                                setInvoice(invoiceData)
                                setPayments(paymentsData)
                                setPaymentSummary(summaryData)
                            }}
                        />
                    )}

                </div>

            </div>

        </div>
    )
}

export default InvoiceView