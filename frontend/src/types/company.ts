export interface Company {
    id: number
    name: string
    logo: string | null
    company_address: string | null
    gst_number: string | null
    state: string | null
    state_code: string | null
    is_active: boolean
    created_at: string
    updated_at: string
}

export interface CompanyCreate {
    name: string
    company_address?: string | null
    gst_number?: string | null
    state?: string | null
    state_code?: string | null
}

export interface CompanyUpdate {
    name?: string | null
    company_address?: string | null
    gst_number?: string | null
    state?: string | null
    state_code?: string | null
    is_active?: boolean | null
}