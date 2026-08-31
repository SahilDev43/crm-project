import apiClient from './client'

import type {
    SalaryComponent,
    SalaryComponentCreate,
    SalaryComponentListResponse,
    SalaryComponentUpdate,
} from '../types/salaryComponent'

export interface GetSalaryComponentsParams {
    search?: string
    component_type?: number
    page?: number
    page_size?: number
}

export const getSalaryComponents = async (
    params: GetSalaryComponentsParams = {},
): Promise<SalaryComponentListResponse> => {
    const response = await apiClient.get<SalaryComponentListResponse>(
        '/salary-components',
        { params },
    )

    return response.data
}

export const getSalaryComponent = async (
    componentId: number,
): Promise<SalaryComponent> => {
    const response = await apiClient.get<SalaryComponent>(
        `/salary-components/${componentId}`,
    )

    return response.data
}

export const createSalaryComponent = async (
    data: SalaryComponentCreate,
): Promise<SalaryComponent> => {
    const response = await apiClient.post<SalaryComponent>(
        '/salary-components',
        data,
    )

    return response.data
}

export const updateSalaryComponent = async (
    componentId: number,
    data: SalaryComponentUpdate,
): Promise<SalaryComponent> => {
    const response = await apiClient.patch<SalaryComponent>(
        `/salary-components/${componentId}`,
        data,
    )

    return response.data
}

export const deleteSalaryComponent = async (
    componentId: number,
): Promise<void> => {
    await apiClient.delete(`/salary-components/${componentId}`)
}
