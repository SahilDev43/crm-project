import apiClient from './client'

import type {
    Attendance,
    AttendanceListResponse,
    AttendanceSession,
    AttendanceUpdate,
} from '../types/attendance'

export interface GetAttendanceParams {
    page?: number
    page_size?: number
    user_id?: number
    attendance_date?: string
    status?: number
    /** Matches user first name, last name or email (backend `ilike`). */
    search?: string
}

export const getAttendance = async (
    params: GetAttendanceParams = {}
): Promise<AttendanceListResponse> => {
    const { attendance_date, ...rest } = params

    const query: Record<string, unknown> = { ...rest }

    // The list endpoint filters by an inclusive date range; translate a
    // single-day filter into matching `date_from` / `date_to` bounds.
    if (attendance_date) {
        query.date_from = attendance_date
        query.date_to = attendance_date
    }

    const response = await apiClient.get<AttendanceListResponse>(
        '/attendance',
        {
            params: query,
        }
    )

    return response.data
}

export const getMyAttendance = async (): Promise<Attendance[]> => {
    const response = await apiClient.get<Attendance[]>(
        '/attendance/my'
    )

    return response.data
}

export const punchIn = async (): Promise<AttendanceSession> => {
    const response = await apiClient.post<AttendanceSession>(
        '/attendance/punch-in'
    )

    return response.data
}

export const punchOut = async (): Promise<AttendanceSession> => {
    const response = await apiClient.post<AttendanceSession>(
        '/attendance/punch-out'
    )

    return response.data
}

export const getUserAttendance = async (
    userId: number
): Promise<Attendance[]> => {
    const response = await apiClient.get<Attendance[]>(
        `/attendance/users/${userId}`
    )

    return response.data
}

export const getAttendanceSessions = async (
    attendanceId: number
): Promise<AttendanceSession[]> => {
    const response = await apiClient.get<AttendanceSession[]>(
        `/attendance/${attendanceId}/sessions`
    )

    return response.data
}

export const updateAttendance = async (
    attendanceId: number,
    data: AttendanceUpdate
): Promise<Attendance> => {
    const response = await apiClient.patch<Attendance>(
        `/attendance/${attendanceId}`,
        data
    )

    return response.data
}