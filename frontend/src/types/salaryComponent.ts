export interface SalaryComponent {
    id: number
    name: string
    code: string
    component_type: number
    description: string | null
    is_active: boolean
    created_at: string
    updated_at: string
}

export interface SalaryComponentCreate {
    name: string
    code: string
    component_type: number
    description?: string | null
    is_active?: boolean
}

export interface SalaryComponentUpdate {
    name?: string | null
    code?: string | null
    component_type?: number | null
    description?: string | null
    is_active?: boolean | null
}

export interface SalaryComponentListResponse {
    items: SalaryComponent[]
    total: number
    page: number
    page_size: number
    total_pages: number
}
