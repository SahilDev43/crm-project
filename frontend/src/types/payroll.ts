export interface PayrollItem {
    id: number
    payroll_id: number
    salary_component_id: number
    component_name: string
    component_code: string
    component_type: number
    calculation_type: number
    calculation_value: string
    calculated_amount: string
}

export interface Payroll {
    id: number
    company_id: number
    user_id: number
    payroll_month: number
    payroll_year: number
    basic_salary: string
    gross_salary: string
    total_deductions: string
    net_salary: string
    status: number
    paid_at: string | null
    remarks: string | null
    created_at: string
    updated_at: string
}

export interface PayrollDetail extends Payroll {
    items: PayrollItem[]
}

export interface PayrollListResponse {
    items: Payroll[]
    total: number
    page: number
    page_size: number
    total_pages: number
}

export interface PayrollProcessRequest {
    user_id: number
    payroll_month: number
    payroll_year: number
}

export interface PayrollUpdateRequest {
    remarks?: string | null
}
