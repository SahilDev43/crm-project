import apiClient from './client'

import type { Permission, PermissionCreate, PermissionListResponse, PermissionUpdate } from '../types/permission'

export interface GetPermissionsParams {
    search?: string
    page?: number
    page_size?: number
}

export const getPermissions = async (
    params: GetPermissionsParams = {}
): Promise<PermissionListResponse> => {
    const response = await apiClient.get<PermissionListResponse>(
        '/permissions/',
        { params }
    )

    return response.data
}

export const getPermission = async (permissionId: number): Promise<Permission> => {
    const response = await apiClient.get<Permission>(
        `/permissions/${permissionId}`
    )
    
    return response.data
}

export const createPermission = async (
    data: PermissionCreate
): Promise<Permission> => {
    const response = await apiClient.post<Permission> (
        `/permissions/`,
        data
    )

    return response.data
}

export const updatePermission = async (
    permissionId: number,
    data: PermissionUpdate
): Promise<Permission> => {
    const response = await apiClient.patch<Permission> (
        `/permissions/${permissionId}`,
        data
    )

    return response.data
}

export const deletePermission = async (
    permissionId: number
): Promise<void> => {
    await apiClient.delete(
        `/permissions/${permissionId}`
    )
}