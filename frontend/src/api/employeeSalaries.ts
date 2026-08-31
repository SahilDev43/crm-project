import apiClient from './client'

import type {
    EmployeeSalary,
    EmployeeSalaryCreate,
    EmployeeSalaryListResponse,
    EmployeeSalaryUpdate,
} from '../types/employeeSalary'

export interface GetEmployeeSalariesParams {
    user_id?: number
    status?: number
    page?: number
    page_size?: number
}

export const getEmployeeSalaries = async (
    params: GetEmployeeSalariesParams = {},
): Promise<EmployeeSalaryListResponse> => {
    const response = await apiClient.get<EmployeeSalaryListResponse>(
        '/employee-salaries',
        { params },
    )

    return response.data
}

export const getEmployeeSalary = async (
    salaryId: number,
): Promise<EmployeeSalary> => {
    const response = await apiClient.get<EmployeeSalary>(
        `/employee-salaries/${salaryId}`,
    )

    return response.data
}

export const createEmployeeSalary = async (
    data: EmployeeSalaryCreate,
): Promise<EmployeeSalary> => {
    const response = await apiClient.post<EmployeeSalary>(
        '/employee-salaries',
        data,
    )

    return response.data
}

export const updateEmployeeSalary = async (
    salaryId: number,
    data: EmployeeSalaryUpdate,
): Promise<EmployeeSalary> => {
    const response = await apiClient.patch<EmployeeSalary>(
        `/employee-salaries/${salaryId}`,
        data,
    )

    return response.data
}

export const deleteEmployeeSalary = async (
    salaryId: number,
): Promise<void> => {
    await apiClient.delete(`/employee-salaries/${salaryId}`)
}
