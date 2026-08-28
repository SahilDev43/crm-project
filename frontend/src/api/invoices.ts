import apiClient from './client'
import axios from 'axios'

import type {
    Invoice,
    InvoiceCreate,
    InvoiceUpdate,
    InvoiceItemCreate,
    InvoiceItemUpdate,
    InvoicePayment,
    InvoicePaymentCreate,
    InvoicePaymentSummary,
    InvoiceListResponse,
} from '../types/invoice'

export const getInvoiceErrorMessage = (
    error: unknown,
    fallback: string,
): string => {
    if (axios.isAxiosError<{ detail?: unknown }>(error)) {
        const detail = error.response?.data?.detail

        if (typeof detail === 'string') {
            return detail
        }
    }

    return fallback
}

export const getInvoices = async(
    page = 1,
    pageSize = 20,
    status?: number,
    dealId?: number,
): Promise<InvoiceListResponse> => {
    const response = await apiClient.get<InvoiceListResponse>(
        '/invoices',
        {
            params: {
                page,
                page_size: pageSize,
                status,
                deal_id: dealId,
            },
        }
    )

    return response.data
}

export const getInvoice = async (
    invoiceId: number
): Promise<Invoice> => {
    const response = await apiClient.get<Invoice>(
        `/invoices/${invoiceId}`
    )

    return response.data
}

export const createInvoice = async (
    data: InvoiceCreate
): Promise<Invoice> => {
    const response = await apiClient.post<Invoice>(
        '/invoices',
        data
    )

    return response.data
}

export const updateInvoice = async (
    invoiceId: number,
    data: InvoiceUpdate
): Promise<Invoice> => {
    const response = await apiClient.patch<Invoice>(
        `/invoices/${invoiceId}`,
        data
    )

    return response.data
}

export const deleteInvoice = async (
    invoiceId: number
): Promise<void> => {
    await apiClient.delete(
        `/invoices/${invoiceId}`
    )
}


export const issueInvoice = async (
    invoiceId: number
): Promise<Invoice> => {
    const response = await apiClient.post<Invoice>(
        `/invoices/${invoiceId}/issue`
    )

    return response.data
}


export const cancelInvoice = async (
    invoiceId: number
): Promise<Invoice> => {
    const response = await apiClient.post<Invoice>(
        `/invoices/${invoiceId}/cancel`
    )

    return response.data
}


export const addInvoiceItem = async (
    invoiceId: number,
    data: InvoiceItemCreate
): Promise<Invoice> => {
    const response = await apiClient.post<Invoice>(
        `/invoices/${invoiceId}/items`,
        data
    )

    return response.data
}


export const updateInvoiceItem = async (
    invoiceId: number,
    itemId: number,
    data: InvoiceItemUpdate
): Promise<Invoice> => {
    const response = await apiClient.patch<Invoice>(
        `/invoices/${invoiceId}/items/${itemId}`,
        data
    )

    return response.data
}


export const deleteInvoiceItem = async (
    invoiceId: number,
    itemId: number
): Promise<Invoice> => {
    const response = await apiClient.delete<Invoice>(
        `/invoices/${invoiceId}/items/${itemId}`
    )

    return response.data
}


export const getInvoicePayments = async (
    invoiceId: number
): Promise<InvoicePayment[]> => {
    const response = await apiClient.get<InvoicePayment[]>(
        `/invoices/${invoiceId}/payments`
    )

    return response.data
}


export const addInvoicePayment = async (
    invoiceId: number,
    data: InvoicePaymentCreate
): Promise<InvoicePayment> => {
    const response = await apiClient.post<InvoicePayment>(
        `/invoices/${invoiceId}/payments`,
        data
    )

    return response.data
}


export const getInvoicePaymentSummary = async (
    invoiceId: number
): Promise<InvoicePaymentSummary> => {
    const response = await apiClient.get<InvoicePaymentSummary>(
        `/invoices/${invoiceId}/payment-summary`
    )

    return response.data
}


export const getInvoicePdf = async (
    invoiceId: number
): Promise<Blob> => {
    const response = await apiClient.get(
        `/invoices/${invoiceId}/pdf`,
        {
            responseType: 'blob',
        }
    )

    return response.data
}
