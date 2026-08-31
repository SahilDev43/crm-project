import apiClient from './client'

import type {
    SalaryStructure,
    SalaryStructureCreate,
    SalaryStructureListResponse,
    SalaryStructureUpdate,
    SalaryStructureComponent,
    SalaryStructureComponentCreate,
} from '../types/salaryStructure'

export interface GetSalaryStructuresParams {
    search?: string
    is_active?: boolean
    page?: number
    page_size?: number
}

export const getSalaryStructures = async (
    params: GetSalaryStructuresParams = {},
): Promise<SalaryStructureListResponse> => {
    const response = await apiClient.get<SalaryStructureListResponse>(
        '/salary-structures',
        { params },
    )

    return response.data
}

export const getSalaryStructure = async (
    structureId: number,
): Promise<SalaryStructure> => {
    const response = await apiClient.get<SalaryStructure>(
        `/salary-structures/${structureId}`,
    )

    return response.data
}

export const createSalaryStructure = async (
    data: SalaryStructureCreate,
): Promise<SalaryStructure> => {
    const response = await apiClient.post<SalaryStructure>(
        '/salary-structures',
        data,
    )

    return response.data
}

export const updateSalaryStructure = async (
    structureId: number,
    data: SalaryStructureUpdate,
): Promise<SalaryStructure> => {
    const response = await apiClient.patch<SalaryStructure>(
        `/salary-structures/${structureId}`,
        data,
    )

    return response.data
}

export const deleteSalaryStructure = async (
    structureId: number,
): Promise<void> => {
    await apiClient.delete(`/salary-structures/${structureId}`)
}

export const getSalaryStructureComponents = async (
    structureId: number,
): Promise<SalaryStructureComponent[]> => {
    const response = await apiClient.get<SalaryStructureComponent[]>(
        `/salary-structures/${structureId}/components`,
    )

    return response.data
}

export const addSalaryStructureComponent = async (
    structureId: number,
    data: SalaryStructureComponentCreate,
): Promise<SalaryStructureComponent> => {
    const response = await apiClient.post<SalaryStructureComponent>(
        `/salary-structures/${structureId}/components`,
        data,
    )

    return response.data
}

export const removeSalaryStructureComponent = async (
    structureId: number,
    componentId: number,
): Promise<void> => {
    await apiClient.delete(
        `/salary-structures/${structureId}/components/${componentId}`,
    )
}
