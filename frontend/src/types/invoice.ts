export interface InvoiceItem {
    id: number
    invoice_id: number
    description: string
    quantity: string
    unit_price: string
    discount: string
    taxable_amount: string
    gst_rate: string
    cgst_rate: string
    cgst_amount: string
    sgst_rate: string
    sgst_amount: string
    igst_rate: string
    igst_amount: string
    total: string
}

export interface InvoiceItemCreate {
    description: string
    quantity?: number | string
    unit_price: number | string
    discount?: number | string
    gst_rate?: number | string
}

export interface InvoiceItemUpdate {
    description?: string | null
    quantity?: number | string | null
    unit_price?: number | string | null
    discount?: number | string | null
    gst_rate?: number | string | null
}

export interface Invoice {
    id: number
    company_id: number
    deal_id: number
    invoice_number: string
    invoice_date: string
    due_date: string | null

    company_name: string
    company_address: string | null
    company_state: string | null
    company_state_code: string | null
    company_gstin: string | null

    customer_name: string
    customer_company: string | null
    customer_email: string | null
    customer_phone: string | null
    customer_address: string | null
    customer_state: string | null
    customer_state_code: string | null
    customer_gstin: string | null

    subtotal: string
    discount: string
    taxable_amount: string
    cgst_amount: string
    sgst_amount: string
    igst_amount: string
    total_tax: string
    grand_total: string

    status: number
    notes: string | null

    created_at: string
    updated_at: string

    items: InvoiceItem[]
}

export interface InvoiceCreate {
    deal_id: number
    invoice_date: string
    due_date?: string | null

    customer_name: string
    customer_company?: string | null
    customer_email?: string | null
    customer_phone?: string | null
    customer_address?: string | null
    customer_state?: string | null
    customer_state_code?: string | null
    customer_gstin?: string | null

    notes?: string | null

    items: InvoiceItemCreate[]
}

export interface InvoiceUpdate {
    due_date?: string | null
    customer_name?: string | null
    customer_company?: string | null
    customer_email?: string | null
    customer_phone?: string | null
    customer_address?: string | null
    customer_state?: string | null
    customer_state_code?: string | null
    customer_gstin?: string | null
    notes?: string | null
    items?: InvoiceItemMutation[]
}

export interface InvoiceItemMutation extends InvoiceItemCreate {
    id?: number
}

export interface InvoicePaymentCreate {
    payment_date: string
    amount: number | string
    payment_method: string
    transaction_reference?: string | null
    remarks?: string | null
}

export interface InvoicePayment {
    id: number
    invoice_id: number
    payment_date: string
    amount: string
    payment_method: string
    transaction_reference: string | null
    remarks: string | null
}

export interface InvoicePaymentSummary {
    invoice_id: number
    grand_total: string
    total_paid: string
    remaining_amount: string
}

export interface InvoiceListResponse {
    items: Invoice[]
    total: number
    page: number
    page_size: number
    total_pages: number
}
