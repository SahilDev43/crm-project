import apiClient from "./client";

import type { Company, CompanyCreate, CompanyUpdate } from "../types/company"

export const getCompanies = async (): Promise<Company[]> => {
    const response = await apiClient.get<Company[]>(
        '/companies'
    )
    
    return response.data
}

export const getCompany = async (
    companyId: number
): Promise<Company> => {
    const response = await apiClient.get<Company>(
        `/companies/${companyId}`
    )

    return response.data
}

export const createCompany = async (
    data: CompanyCreate
): Promise<Company> => {
    const response = await apiClient.post<Company>(
        '/companies',
        data
    )

    return response.data
}

export const updateCompany = async (
    companyId: number,
    data: CompanyUpdate
): Promise<Company> => {
    const response = await apiClient.patch<Company>(
        `/companies/${companyId}`,
        data
    )

    return response.data
}

export const deleteCompany = async (
    companyId: number
): Promise<void> => {
    await apiClient.delete(
        `/companies/${companyId}`
    )
}