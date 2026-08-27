import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'

import { getDeals, getDealStatuses } from '../../api/deals'
import { createInvoice } from '../../api/invoices'

import type { Deal } from '../../types/deal'
import type { InvoiceCreate as InvoiceCreateData } from '../../types/invoice'

interface InvoiceCreateProps {
    onClose: () => void
    onSuccess: () => void | Promise<void>
}

interface InvoiceItemForm {
    description: string
    quantity: string
    unit_price: string
    discount: string
    gst_rate: string
}

function InvoiceCreate({
    onClose,
    onSuccess,
}: InvoiceCreateProps) {
    const today = new Date().toISOString().split('T')[0]

    const [deals, setDeals] = useState<Deal[]>([])
    const [dealId, setDealId] = useState('')

    const [invoiceDate, setInvoiceDate] = useState(today)
    const [dueDate, setDueDate] = useState('')

    const [customerName, setCustomerName] = useState('')
    const [customerCompany, setCustomerCompany] = useState('')
    const [customerEmail, setCustomerEmail] = useState('')
    const [customerPhone, setCustomerPhone] = useState('')

    const [customerAddress, setCustomerAddress] = useState('')
    const [customerState, setCustomerState] = useState('')
    const [customerStateCode, setCustomerStateCode] = useState('')
    const [customerGstin, setCustomerGstin] = useState('')

    const [notes, setNotes] = useState('')

    const [items, setItems] = useState<InvoiceItemForm[]>([
        {
            description: '',
            quantity: '1',
            unit_price: '',
            discount: '0',
            gst_rate: '0',
        },
    ])

    const [loadingDeals, setLoadingDeals] = useState(true)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [dealSearch, setDealSearch] = useState('')
    const [showDealResults, setShowDealResults] = useState(false)
    const [wonStatusId, setWonStatusId] = useState<number | null>(null)
    const [searchingDeals, setSearchingDeals] = useState(false)

    useEffect(() => {
        const loadWonStatus = async () => {
            try {
                setLoadingDeals(true)
                setError('')

                const statuses = await getDealStatuses()

                const wonStatus = statuses.find(
                    (status) =>
                        status.code.toLowerCase() === 'won'
                )

                if (!wonStatus) {
                    setError('Won deal status was not found.')
                    return
                }

                setWonStatusId(wonStatus.id)
            } catch (error: any) {
                setError(
                    error.response?.data?.detail ||
                    'Unable to load deal statuses.'
                )
            } finally {
                setLoadingDeals(false)
            }
        }

        loadWonStatus()
    }, [])

    useEffect(() => {
        if (wonStatusId === null) {
            return
        }

        const searchWonDeals = async () => {
            try {
                setSearchingDeals(true)

                const response = await getDeals({
                    deal_status_id: wonStatusId,
                    search: dealSearch.trim() || undefined,
                    page: 1,
                    page_size: 10,
                })

                setDeals(response.items)
            } catch (error: any) {
                setError(
                    error.response?.data?.detail ||
                    'Unable to search won deals.'
                )
            } finally {
                setSearchingDeals(false)
            }
        }

        const timer = window.setTimeout(() => {
            searchWonDeals()
        }, 300)

        return () => window.clearTimeout(timer)
    }, [dealSearch, wonStatusId])

    const handleDealChange = (deal: Deal) => {
        setDealId(String(deal.id))
        setDealSearch(`${deal.title} — ${deal.client_name}`)
        setShowDealResults(false)

        setCustomerName(deal.client_name || '')
        setCustomerEmail(deal.client_email || '')
        setCustomerPhone(deal.client_phone || '')
    }

    const updateItem = (
        index: number,
        field: keyof InvoiceItemForm,
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
            },
        ])
    }

    const removeItem = (index: number) => {
        if (items.length === 1) {
            return
        }

        setItems((currentItems) =>
            currentItems.filter(
                (_, itemIndex) => itemIndex !== index
            )
        )
    }

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault()

        setError('')

        if (!dealId) {
            setError('Please select a deal.')
            return
        }

        if (!invoiceDate) {
            setError('Invoice date is required.')
            return
        }

        if (!customerName.trim()) {
            setError('Customer name is required.')
            return
        }

        if (items.length === 0) {
            setError('Add at least one invoice item.')
            return
        }

        for (const item of items) {
            if (!item.description.trim()) {
                setError('Every invoice item needs a description.')
                return
            }

            if (
                !item.unit_price ||
                Number(item.unit_price) < 0
            ) {
                setError('Enter a valid unit price for every item.')
                return
            }

            if (
                !item.quantity ||
                Number(item.quantity) <= 0
            ) {
                setError('Quantity must be greater than zero.')
                return
            }
        }

        const data: InvoiceCreateData = {
            deal_id: Number(dealId),
            invoice_date: invoiceDate,
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
                description: item.description.trim(),
                quantity: Number(item.quantity),
                unit_price: item.unit_price,
                discount: item.discount || '0',
                gst_rate: item.gst_rate || '0',
            })),
        }

        try {
            setLoading(true)

            await createInvoice(data)

            await onSuccess()
        } catch (error: any) {
            setError(
                error.response?.data?.detail ||
                'Unable to create invoice.'
            )
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 p-4">

            <div className="mx-auto my-8 w-full max-w-5xl rounded-xl bg-white shadow-xl">

                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">

                    <div>
                        <h2 className="text-xl font-bold text-slate-900">
                            Create Invoice
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Create an invoice from an existing deal.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
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

                    {/* Deal + Dates */}

                    <div className="grid gap-5 md:grid-cols-3">

                        <div className="md:col-span-1">
                            <label className="block text-sm font-medium text-slate-700">
                                Deal *
                            </label>

                            <div className="relative">
                                <input
                                    type="text"
                                    value={dealSearch}
                                    onChange={(event) => {
                                        setDealSearch(event.target.value)
                                        setShowDealResults(true)
                                        setDealId('')
                                    }}
                                    onFocus={() => setShowDealResults(true)}
                                    disabled={loading || loadingDeals}
                                    placeholder={
                                        loadingDeals
                                            ? 'Loading...'
                                            : 'Search won deals...'
                                    }
                                    className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-red-500"
                                />

                                {showDealResults && dealSearch.trim() && (
                                    <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-72 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">

                                        {searchingDeals ? (
                                            <div className="px-4 py-3 text-sm text-slate-500">
                                                Searching...
                                            </div>
                                        ) : deals.length === 0 ? (
                                            <div className="px-4 py-3 text-sm text-slate-500">
                                                No won deals found.
                                            </div>
                                        ) : (
                                            deals.map((deal) => (
                                                <button
                                                    key={deal.id}
                                                    type="button"
                                                    onClick={() =>
                                                        handleDealChange(deal)
                                                    }
                                                    className="block w-full border-b border-slate-100 px-4 py-3 text-left hover:bg-slate-50"
                                                >
                                                    <div className="text-sm font-medium text-slate-900">
                                                        {deal.title}
                                                    </div>

                                                    <div className="mt-1 text-xs text-slate-500">
                                                        {deal.client_name}

                                                        {deal.client_email && (
                                                            <> • {deal.client_email}</>
                                                        )}
                                                    </div>

                                                    <div className="mt-1 text-xs text-slate-400">
                                                        Deal #{deal.id}
                                                    </div>
                                                </button>
                                            ))
                                        )}

                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700">
                                Invoice Date *
                            </label>

                            <input
                                type="date"
                                value={invoiceDate}
                                onChange={(event) =>
                                    setInvoiceDate(event.target.value)
                                }
                                disabled={loading}
                                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-red-500"
                            />
                        </div>

                        <div>
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

                    </div>

                    {/* Customer */}

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
                                    className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm uppercase outline-none focus:border-red-500"
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
                                    key={index}
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
                                                placeholder="Service description"
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

                                                {items.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeItem(index)
                                                        }
                                                        disabled={loading}
                                                        className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                                                        title="Remove item"
                                                    >
                                                        <Trash2 size={17} />
                                                    </button>
                                                )}

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
                            placeholder="Optional notes for the invoice"
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
                            disabled={loading || loadingDeals}
                            className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {loading
                                ? 'Creating...'
                                : 'Create Invoice'}
                        </button>

                    </div>

                </form>

            </div>

        </div>
    )
}

export default InvoiceCreate