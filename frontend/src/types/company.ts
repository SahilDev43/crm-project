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

export interface CompanyListResponse {
    items: Company[]
    total: number
    page: number
    page_size: number
    total_pages: number
}

export interface CompanyApiKey {
    id: number
    company_id: number
    name: string
    key_prefix: string
    is_active: boolean
    created_at: string
    updated_at: string
}

export interface CompanyApiKeyCreate {
    name: string
}

export interface CompanyApiKeyCreateResponse extends CompanyApiKey {
    api_key: string
}