import apiClient from "./client";

import type { Company, CompanyCreate, CompanyUpdate, CompanyApiKey, CompanyApiKeyCreate, CompanyApiKeyCreateResponse } from "../types/company"

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

export const uploadCompanyLogo = async (
    companyId: number,
    file: File
): Promise<Company> => {

    const formData = new FormData()

    formData.append('logo', file)

    const response = await apiClient.post<Company>(
        `/companies/${companyId}/logo`,
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }
    )
    
    return response.data
}

export const removeCompanyLogo = async (
    companyId: number,   
): Promise<Company> => {
    const response = await apiClient.delete<Company>(
        `/companies/${companyId}/logo`
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

export const getCompanyApiKeys = async (
    companyId: number
): Promise<CompanyApiKey[]> => {
    const response = await apiClient.get<CompanyApiKey[]>(
        `/companies/${companyId}/api-keys`
    )

    return response.data
}

export const createCompanyApiKey = async (
    companyId: number,
    data: CompanyApiKeyCreate
): Promise<CompanyApiKeyCreateResponse> => {
    const response = 
    await apiClient.post<CompanyApiKeyCreateResponse>(
        `/companies/${companyId}/api-keys`,
        data
    )

    return response.data
}

export const deleteCompanyApiKey = async (
    companyId: number,
    keyId: number
): Promise<void> => {
    await apiClient.delete(
        `/companies/${companyId}/api-keys/${keyId}`
    )
}