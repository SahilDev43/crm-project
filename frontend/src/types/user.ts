export interface User {
  id: number
  first_name: string
  last_name: string
  email: string
  phone: string | null
  role_id: number | null
  company_id: number | null
  profile_image: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface UserCreate {
  first_name: string
  last_name: string
  email: string
  phone?: string | null
  password: string
  company_id: number
  role_id?: number | null
}

export interface UserUpdate {
  first_name?: string | null
  last_name?: string | null
  email?: string | null
  phone?: string | null
  password?: string | null
  role_id?: number | null
  company_id?: number | null
  is_active?: boolean | null
}