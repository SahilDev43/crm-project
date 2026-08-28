import { useState } from 'react'
import type { FormEvent } from 'react'
import { Plus, Save, Trash2, X } from 'lucide-react'

import {
    updateInvoice,
    getInvoiceErrorMessage,
} from '../../api/invoices'

import type {
    Invoice,
} from '../../types/invoice'

interface InvoiceEditProps {
    invoice: Invoice
    onClose: () => void
    onSuccess: () => void | Promise<void>
}

interface ItemForm {
    id?: number
    description: string
    quantity: string
    unit_price: string
    discount: string
    gst_rate: string
    isNew?: boolean
}

function InvoiceEdit({
    invoice,
    onClose,
    onSuccess,
}: InvoiceEditProps) {
    const [dueDate, setDueDate] = useState(
        invoice.due_date || ''
    )

    const [customerName, setCustomerName] = useState(
        invoice.customer_name
    )

    const [customerCompany, setCustomerCompany] = useState(
        invoice.customer_company || ''
    )

    const [customerEmail, setCustomerEmail] = useState(
        invoice.customer_email || ''
    )

    const [customerPhone, setCustomerPhone] = useState(
        invoice.customer_phone || ''
    )

    const [customerAddress, setCustomerAddress] = useState(
        invoice.customer_address || ''
    )

    const [customerState, setCustomerState] = useState(
        invoice.customer_state || ''
    )

    const [customerStateCode, setCustomerStateCode] = useState(
        invoice.customer_state_code || ''
    )

    const [customerGstin, setCustomerGstin] = useState(
        invoice.customer_gstin || ''
    )

    const [notes, setNotes] = useState(
        invoice.notes || ''
    )

    const [items, setItems] = useState<ItemForm[]>(
        invoice.items.map((item) => ({
            id: item.id,
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            discount: item.discount,
            gst_rate: item.gst_rate,
        }))
    )

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const updateItem = (
        index: number,
        field: keyof ItemForm,
        value: string
    ) => {
        setItems((currentItems) =>
            currentItems.map((item, itemIndex) =>
                itemIndex === index
                    ? {
                        ...item,
                        [field]: value,
                    }
                    : item
            )
        )
    }

    const addItem = () => {
        setItems((currentItems) => [
            ...currentItems,
            {
                description: '',
                quantity: '1',
                unit_price: '',
                discount: '0',
                gst_rate: '0',
                isNew: true,
            },
        ])
    }

    const removeItem = (index: number) => {
        setItems((currentItems) =>
            currentItems.filter(
                (_, itemIndex) => itemIndex !== index
            )
        )
    }

    const validateItems = () => {
        if (items.length === 0) {
            setError(
                'Invoice must contain at least one item.'
            )
            return false
        }

        for (const item of items) {
            if (!item.description.trim()) {
                setError(
                    'Every invoice item needs a description.'
                )
                return false
            }

            if (
                !item.quantity ||
                Number(item.quantity) <= 0
            ) {
                setError(
                    'Quantity must be greater than zero.'
                )
                return false
            }

            if (
                !item.unit_price ||
                Number(item.unit_price) < 0
            ) {
                setError(
                    'Enter a valid unit price for every item.'
                )
                return false
            }
        }

        return true
    }

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault()

        setError('')

        if (!customerName.trim()) {
            setError('Customer name is required.')
            return
        }

        if (!validateItems()) {
            return
        }

        try {
            setLoading(true)

            await updateInvoice(invoice.id, {
                due_date: dueDate || null,
                customer_name: customerName.trim(),
                customer_company:
                    customerCompany.trim() || null,
                customer_email:
                    customerEmail.trim() || null,
                customer_phone:
                    customerPhone.trim() || null,
                customer_address:
                    customerAddress.trim() || null,
                customer_state:
                    customerState.trim() || null,
                customer_state_code:
                    customerStateCode.trim() || null,
                customer_gstin:
                    customerGstin.trim() || null,
                notes: notes.trim() || null,
                items: items.map((item) => ({
                    ...(item.id ? { id: item.id } : {}),
                        description:
                            item.description.trim(),
                        quantity: Number(item.quantity),
                        unit_price: item.unit_price,
                        discount:
                            item.discount || '0',
                        gst_rate:
                            item.gst_rate || '0',
                })),
            })

            await onSuccess()
        } catch (error: unknown) {
            setError(getInvoiceErrorMessage(error, 'Unable to update invoice.'))
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 p-4">

            <div className="mx-auto my-8 w-full max-w-5xl rounded-xl bg-white shadow-xl">

                {/* Header */}

                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">

                    <div>
                        <h2 className="text-xl font-bold text-slate-900">
                            Edit Invoice
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            {invoice.invoice_number}
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
                    className="space-y-6 p-6"
                >

                    {error && (
                        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    {/* Read-only Invoice Info */}

                    <div className="grid gap-4 rounded-lg bg-slate-50 p-4 md:grid-cols-3">

                        <div>
                            <p className="text-xs font-medium uppercase text-slate-400">
                                Invoice Number
                            </p>

                            <p className="mt-1 text-sm font-semibold text-slate-900">
                                {invoice.invoice_number}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-medium uppercase text-slate-400">
                                Invoice Date
                            </p>

                            <p className="mt-1 text-sm font-semibold text-slate-900">
                                {invoice.invoice_date}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-medium uppercase text-slate-400">
                                Deal
                            </p>

                            <p className="mt-1 text-sm font-semibold text-slate-900">
                                #{invoice.deal_id}
                            </p>
                        </div>

                    </div>

                    {/* Due Date */}

                    <div className="max-w-sm">
                        <label className="block text-sm font-medium text-slate-700">
                            Due Date
                        </label>

                        <input
                            type="date"
                            value={dueDate}
                            onChange={(event) =>
                                setDueDate(event.target.value)
                            }
                            disabled={loading}
                            className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-red-500"
                        />
                    </div>

                    {/* Customer Details */}

                    <div>

                        <h3 className="mb-4 text-sm font-semibold text-slate-900">
                            Customer Details
                        </h3>

                        <div className="grid gap-5 md:grid-cols-2">

                            <div>
                                <label className="block text-sm font-medium text-slate-700">
                                    Customer Name *
                                </label>

                                <input
                                    value={customerName}
                                    onChange={(event) =>
                                        setCustomerName(event.target.value)
                                    }
                                    disabled={loading}
                                    className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-red-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700">
                                    Company
                                </label>

                                <input
                                    value={customerCompany}
                                    onChange={(event) =>
                                        setCustomerCompany(event.target.value)
                                    }
                                    disabled={loading}
                                    className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-red-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700">
                                    Email
                                </label>

                                <input
                                    type="email"
                                    value={customerEmail}
                                    onChange={(event) =>
                                        setCustomerEmail(event.target.value)
                                    }
                                    disabled={loading}
                                    className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-red-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700">
                                    Phone
                                </label>

                                <input
                                    value={customerPhone}
                                    onChange={(event) =>
                                        setCustomerPhone(event.target.value)
                                    }
                                    disabled={loading}
                                    className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-red-500"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700">
                                    Address
                                </label>

                                <textarea
                                    rows={2}
                                    value={customerAddress}
                                    onChange={(event) =>
                                        setCustomerAddress(event.target.value)
                                    }
                                    disabled={loading}
                                    className="mt-1.5 w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-red-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700">
                                    State
                                </label>

                                <input
                                    value={customerState}
                                    onChange={(event) =>
                                        setCustomerState(event.target.value)
                                    }
                                    disabled={loading}
                                    className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-red-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700">
                                    State Code
                                </label>

                                <input
                                    value={customerStateCode}
                                    onChange={(event) =>
                                        setCustomerStateCode(event.target.value)
                                    }
                                    disabled={loading}
                                    className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-red-500"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700">
                                    GSTIN
                                </label>

                                <input
                                    value={customerGstin}
                                    onChange={(event) =>
                                        setCustomerGstin(event.target.value)
                                    }
                                    disabled={loading}
                                    className="mt-1.5 w-full uppercase rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-red-500"
                                />
                            </div>

                        </div>

                    </div>

                    {/* Items */}

                    <div>

                        <div className="mb-4 flex items-center justify-between">

                            <h3 className="text-sm font-semibold text-slate-900">
                                Invoice Items
                            </h3>

                            <button
                                type="button"
                                onClick={addItem}
                                disabled={loading}
                                className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                            >
                                <Plus size={15} />
                                Add Item
                            </button>

                        </div>

                        <div className="space-y-4">

                            {items.map((item, index) => (
                                <div
                                    key={item.id ?? `new-${index}`}
                                    className="rounded-xl border border-slate-200 p-4"
                                >

                                    <div className="grid gap-4 md:grid-cols-6">

                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-medium uppercase text-slate-400">
                                                Description
                                            </label>

                                            <input
                                                value={item.description}
                                                onChange={(event) =>
                                                    updateItem(
                                                        index,
                                                        'description',
                                                        event.target.value
                                                    )
                                                }
                                                disabled={loading}
                                                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-red-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium uppercase text-slate-400">
                                                Quantity
                                            </label>

                                            <input
                                                type="number"
                                                min="0.01"
                                                step="0.01"
                                                value={item.quantity}
                                                onChange={(event) =>
                                                    updateItem(
                                                        index,
                                                        'quantity',
                                                        event.target.value
                                                    )
                                                }
                                                disabled={loading}
                                                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-red-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium uppercase text-slate-400">
                                                Unit Price
                                            </label>

                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={item.unit_price}
                                                onChange={(event) =>
                                                    updateItem(
                                                        index,
                                                        'unit_price',
                                                        event.target.value
                                                    )
                                                }
                                                disabled={loading}
                                                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-red-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium uppercase text-slate-400">
                                                Discount
                                            </label>

                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={item.discount}
                                                onChange={(event) =>
                                                    updateItem(
                                                        index,
                                                        'discount',
                                                        event.target.value
                                                    )
                                                }
                                                disabled={loading}
                                                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-red-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium uppercase text-slate-400">
                                                GST %
                                            </label>

                                            <div className="mt-1.5 flex gap-2">

                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={item.gst_rate}
                                                    onChange={(event) =>
                                                        updateItem(
                                                            index,
                                                            'gst_rate',
                                                            event.target.value
                                                        )
                                                    }
                                                    disabled={loading}
                                                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-red-500"
                                                />

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeItem(index)
                                                    }
                                                    disabled={
                                                        loading ||
                                                        items.length === 1
                                                    }
                                                    className="rounded-lg p-2 text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                                                    title="Remove item"
                                                >
                                                    <Trash2 size={17} />
                                                </button>

                                            </div>
                                        </div>

                                    </div>

                                </div>
                            ))}

                        </div>

                    </div>

                    {/* Notes */}

                    <div>
                        <label className="block text-sm font-medium text-slate-700">
                            Notes
                        </label>

                        <textarea
                            rows={3}
                            value={notes}
                            onChange={(event) =>
                                setNotes(event.target.value)
                            }
                            disabled={loading}
                            className="mt-1.5 w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-red-500"
                        />
                    </div>

                    {/* Footer */}

                    <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">

                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Save size={16} />

                            {loading
                                ? 'Saving...'
                                : 'Save Changes'}
                        </button>

                    </div>

                </form>

            </div>

        </div>
    )
}

export default InvoiceEdit
