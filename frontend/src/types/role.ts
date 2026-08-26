export interface Role {
    id: number
    name: string
    description: string | null
}

export interface RoleCreate {
    name: string
    description: string | null
}

export interface RoleUpdate {
    name?: string | null
    description?: string | null
}