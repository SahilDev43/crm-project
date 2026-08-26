export interface Permission {
    id: number
    name: string
    description: string | null
    created_at: string
    updated_at: string
}

export interface PermissionCreate {
    name: string
    description?: string | null
}

export interface PermissionUpdate {
    name?: string | null
    description?: string | null
}

export interface PermissionListResponse {
    items: Permission[]
    total: number
    page: number
    page_size: number
    total_pages: number
}