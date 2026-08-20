export interface User {
    id: number
    first_name: string
    last_name: string
    email: string
    phone: string | null
    role_id: number | null
    company_id: number
    profile_image: string | null
    is_active: boolean
    is_verified: boolean
    created_at: string
    updated_at: string
    is_deleted: boolean
}

export interface LoginRequest {
    email: string
    password: string
}

export interface TokenResponse {
    access_token: string
    refresh_token: string
    token_type: string
}