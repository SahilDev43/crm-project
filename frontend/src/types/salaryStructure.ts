export interface SalaryStructure {
    id: number
    company_id: number
    name: string
    code: string
    description: string | null
    is_active: boolean
    created_at: string
    updated_at: string
}

export interface SalaryStructureCreate {
    name: string
    code: string
    description?: string | null
    is_active?: boolean
}

export interface SalaryStructureUpdate {
    name?: string | null
    code?: string | null
    description?: string | null
    is_active?: boolean | null
}

export interface SalaryStructureListResponse {
    items: SalaryStructure[]
    total: number
    page: number
    page_size: number
    total_pages: number
}

export interface SalaryStructureComponent {
    id: number
    salary_structure_id: number
    salary_component_id: number
    calculation_type: number
    calculation_base: number | null
    calculation_base_component_id: number | null
    value: string
    is_active: boolean
    created_at: string
    updated_at: string
}

export interface SalaryStructureComponentCreate {
    salary_component_id: number
    calculation_type: number
    calculation_base?: number | null
    calculation_base_component_id?: number | null
    value: string | number
    is_active?: boolean
}
