import apiClient from './client'

import type {
    Payroll,
    PayrollDetail,
    PayrollItem,
    PayrollListResponse,
    PayrollProcessRequest,
    PayrollUpdateRequest,
} from '../types/payroll'

export interface GetPayrollsParams {
    user_id?: number
    payroll_month?: number
    payroll_year?: number
    status?: number
    page?: number
    page_size?: number
}

export const getPayrolls = async (
    params: GetPayrollsParams = {},
): Promise<PayrollListResponse> => {
    const response = await apiClient.get<PayrollListResponse>('/payrolls', {
        params,
    })

    return response.data
}

export const getPayroll = async (
    payrollId: number,
): Promise<PayrollDetail> => {
    const response = await apiClient.get<PayrollDetail>(
        `/payrolls/${payrollId}`,
    )

    return response.data
}

export const getPayrollItems = async (
    payrollId: number,
): Promise<PayrollItem[]> => {
    const response = await apiClient.get<PayrollItem[]>(
        `/payrolls/${payrollId}/items`,
    )

    return response.data
}

export const processPayroll = async (
    data: PayrollProcessRequest,
): Promise<Payroll> => {
    const response = await apiClient.post<Payroll>('/payrolls/process', data)

    return response.data
}

export const markPayrollAsPaid = async (
    payrollId: number,
): Promise<Payroll> => {
    const response = await apiClient.patch<Payroll>(
        `/payrolls/${payrollId}/pay`,
    )

    return response.data
}

export const updatePayroll = async (
    payrollId: number,
    data: PayrollUpdateRequest,
): Promise<Payroll> => {
    const response = await apiClient.patch<Payroll>(
        `/payrolls/${payrollId}`,
        data,
    )

    return response.data
}
