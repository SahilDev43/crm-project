import apiClient from './client'
import type {
    AttendanceReport,
    AttendanceUserListResponse,
    DealPerformanceListResponse,
    DealPipelineItem,
    ExportReportType,
    InvoiceStatusCount,
    LeadSourceCount,
    LeadStatusCount,
    PayrollEmployeeListResponse,
    PayrollReport,
    PerformanceListResponse,
    ReportSortBy,
    ReportSummary,
    RevenueReport,
    RevenueTrendPoint,
    SalesReport,
} from '../types/report'

export interface DateRangeParams {
    date_from?: string
    date_to?: string
}

export interface UserScopedParams extends DateRangeParams {
    user_id?: number
}

export interface PaginationParams {
    page?: number
    page_size?: number
}

export const getReportSummary = async (): Promise<ReportSummary> => {
    const response = await apiClient.get<ReportSummary>('/reports/summary')
    return response.data
}

export const getSalesReport = async (
    params: UserScopedParams = {},
): Promise<SalesReport> => {
    const response = await apiClient.get<SalesReport>('/reports/sales', { params })
    return response.data
}

export const getLeadStatusReport = async (
    params: UserScopedParams = {},
): Promise<LeadStatusCount[]> => {
    const response = await apiClient.get<LeadStatusCount[]>('/reports/leads/status', {
        params,
    })
    return response.data
}

export const getLeadSourceReport = async (
    params: UserScopedParams = {},
): Promise<LeadSourceCount[]> => {
    const response = await apiClient.get<LeadSourceCount[]>('/reports/leads/sources', {
        params,
    })
    return response.data
}

export const getDealPipelineReport = async (
    params: UserScopedParams = {},
): Promise<DealPipelineItem[]> => {
    const response = await apiClient.get<DealPipelineItem[]>('/reports/deals/pipeline', {
        params,
    })
    return response.data
}

export const getDealPerformanceReport = async (
    params: UserScopedParams & PaginationParams = {},
): Promise<DealPerformanceListResponse> => {
    const response = await apiClient.get<DealPerformanceListResponse>(
        '/reports/deals/performance',
        { params },
    )
    return response.data
}

export const getRevenueReport = async (
    params: DateRangeParams = {},
): Promise<RevenueReport> => {
    const response = await apiClient.get<RevenueReport>('/reports/revenue', { params })
    return response.data
}

export const getRevenueTrend = async (
    params: DateRangeParams = {},
): Promise<RevenueTrendPoint[]> => {
    const response = await apiClient.get<RevenueTrendPoint[]>('/reports/revenue/trend', {
        params,
    })
    return response.data
}

export const getInvoiceStatusReport = async (
    params: DateRangeParams = {},
): Promise<InvoiceStatusCount[]> => {
    const response = await apiClient.get<InvoiceStatusCount[]>('/reports/invoices/status', {
        params,
    })
    return response.data
}

export const getAttendanceReport = async (
    params: UserScopedParams = {},
): Promise<AttendanceReport> => {
    const response = await apiClient.get<AttendanceReport>('/reports/attendance', {
        params,
    })
    return response.data
}

export const getAttendanceUserReport = async (
    params: DateRangeParams & PaginationParams = {},
): Promise<AttendanceUserListResponse> => {
    const response = await apiClient.get<AttendanceUserListResponse>(
        '/reports/attendance/users',
        { params },
    )
    return response.data
}

export interface PayrollParams {
    month?: number
    year?: number
    user_id?: number
}

export const getPayrollReport = async (
    params: PayrollParams = {},
): Promise<PayrollReport> => {
    const response = await apiClient.get<PayrollReport>('/reports/payroll', { params })
    return response.data
}

export const getPayrollEmployeeReport = async (
    params: PayrollParams & PaginationParams = {},
): Promise<PayrollEmployeeListResponse> => {
    const response = await apiClient.get<PayrollEmployeeListResponse>(
        '/reports/payroll/employees',
        { params },
    )
    return response.data
}

export const getPerformanceReport = async (
    params: UserScopedParams & PaginationParams & { sort_by?: ReportSortBy } = {},
): Promise<PerformanceListResponse> => {
    const response = await apiClient.get<PerformanceListResponse>('/reports/performance', {
        params,
    })
    return response.data
}

export const exportReport = async (
    reportType: ExportReportType,
    params: UserScopedParams & PayrollParams = {},
): Promise<void> => {
    const response = await apiClient.get<Blob>(`/reports/${reportType}/export`, {
        params,
        responseType: 'blob',
    })

    const url = window.URL.createObjectURL(response.data)
    const link = document.createElement('a')
    link.href = url
    link.download = `${reportType}.csv`
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
}
