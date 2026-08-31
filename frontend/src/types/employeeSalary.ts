export interface EmployeeSalary {
    id: number
    user_id: number
    salary_structure_id: number
    effective_from: string
    effective_to: string | null
    basic_salary: string
    gross_salary: string | null
    status: number
    remarks: string | null
    created_at: string
    updated_at: string
}

export interface EmployeeSalaryCreate {
    user_id: number
    salary_structure_id: number
    effective_from: string
    effective_to?: string | null
    basic_salary: string | number
    gross_salary?: string | number | null
    status?: number
    remarks?: string | null
}

export interface EmployeeSalaryUpdate {
    salary_structure_id?: number | null
    effective_from?: string | null
    effective_to?: string | null
    basic_salary?: string | number | null
    gross_salary?: string | number | null
    status?: number | null
    remarks?: string | null
}

export interface EmployeeSalaryListResponse {
    items: EmployeeSalary[]
    total: number
    page: number
    page_size: number
    total_pages: number
}
