export interface TodayAttendanceSummary {
    present: boolean
    currently_working: boolean
    total_time_minutes: number
}

export interface ReportSummary {
    // Admin / company-wide
    total_leads?: number
    total_deals?: number
    won_deals?: number
    lost_deals?: number
    total_invoices?: number
    total_invoiced_amount?: string
    total_paid_amount?: string
    total_outstanding_amount?: string
    total_employees?: number
    present_today?: number
    absent_today?: number
    currently_working?: number

    // HR
    late_today?: number
    attendance_percentage?: number

    // Normal user (self-scoped)
    my_leads?: number
    my_active_deals?: number
    my_won_deals?: number
    my_invoices?: number
    my_outstanding_amount?: string
    my_attendance_today?: TodayAttendanceSummary
}

export interface SalesReport {
    total_leads: number
    new_leads: number
    converted_leads: number
    lost_leads: number
    total_deals: number
    active_deals: number
    won_deals: number
    lost_deals: number
    conversion_rate: number
}

export interface LeadStatusCount {
    status_id: number
    status_name: string
    count: number
}

export interface LeadSourceCount {
    source: string
    count: number
}

export interface DealPipelineItem {
    status_id: number
    status_name: string
    count: number
    total_value: string
}

export interface DealPerformanceItem {
    user_id: number
    user_name: string
    total_deals: number
    won_deals: number
    lost_deals: number
    win_rate: number
}

export interface DealPerformanceListResponse {
    items: DealPerformanceItem[]
    total: number
    page: number
    page_size: number
    total_pages: number
}

export interface RevenueReport {
    total_invoiced: string
    total_paid: string
    total_outstanding: string
    total_overdue: string
}

export interface RevenueTrendPoint {
    period: string
    invoiced_amount: string
    paid_amount: string
    outstanding_amount: string
}

export interface InvoiceStatusCount {
    status: string
    count: number
    total_amount: string
}

export interface AttendanceReport {
    total_days: number
    present_days: number
    absent_days: number
    late_days: number
    total_working_time: number
    average_working_time: number
}

export interface AttendanceUserItem {
    user_id: number
    user_name: string
    present_days: number
    absent_days: number
    late_days: number
    total_working_time: number
    average_working_time: number
}

export interface AttendanceUserListResponse {
    items: AttendanceUserItem[]
    total: number
    page: number
    page_size: number
    total_pages: number
}

export interface PayrollReport {
    total_payroll: number
    total_gross_salary: string
    total_deductions: string
    total_net_salary: string
    paid_payroll: number
    pending_payroll: number
}

export interface PayrollEmployeeItem {
    user_id: number
    user_name: string
    gross_salary: string
    deductions: string
    net_salary: string
    status: string
}

export interface PayrollEmployeeListResponse {
    items: PayrollEmployeeItem[]
    total: number
    page: number
    page_size: number
    total_pages: number
}

export interface PerformanceItem {
    user_id: number
    user_name: string
    leads_count: number
    deals_count: number
    won_deals: number
    win_rate: number
    invoices_count: number
    revenue_generated: string
}

export interface PerformanceListResponse {
    items: PerformanceItem[]
    total: number
    page: number
    page_size: number
    total_pages: number
}

export type ReportSortBy = 'leads' | 'deals' | 'won_deals' | 'win_rate'

export type ExportReportType =
    | 'sales'
    | 'leads-status'
    | 'leads-sources'
    | 'deals-pipeline'
    | 'deals-performance'
    | 'revenue'
    | 'revenue-trend'
    | 'invoices-status'
    | 'attendance'
    | 'attendance-users'
    | 'payroll'
    | 'payroll-employees'
    | 'performance'
