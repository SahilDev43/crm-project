export interface AttendanceUser {
    id: number
    first_name: string
    last_name: string
    email: string
}

export interface AttendanceSession {
    id: number
    attendance_id: number
    user_id: number
    punch_in_at: string
    punch_out_at: string | null
    total_time: number | null
    auto_closed: boolean
    in_ip_address: string | null
    out_ip_address: string | null
    created_at: string
    updated_at: string
}

export interface Attendance {
    attendance_date: string
    status: number
    remarks: string | null
    id: number
    company_id: number
    user_id: number
    total_time: number
    user: AttendanceUser | null
    session_count: number
    created_at: string
    updated_at: string
}

export interface AttendanceUpdate {
    status?: number | null
    remarks?: string | null
}

export interface AttendanceListResponse {
    items: Attendance[]
    total: number
    page: number
    page_size: number
    total_pages: number
}