import apiClient from './client'
import type { Role, RoleCreate, RoleUpdate } from '../types/role'
import type { Permission } from '../types/permission'

export const getRoles = async (): Promise<Role[]> => {
  const response = await apiClient.get<Role[]>('/roles/')

  return response.data
}

export const getRole = async (roleId: number): Promise<Role> => {
  const response = await apiClient.get<Role>(
    `/roles/${roleId}`
  )

  return response.data
}

export const createRole = async (
  data: RoleCreate
): Promise<Role> => {
  const response = await apiClient.post<Role>(
    '/roles/',
    data
  )

  return response.data
}

export const updateRole = async (
  roleId: number,
  data: RoleUpdate
): Promise<Role> => {
  const response = await apiClient.patch<Role>(
    `/roles/${roleId}`,
    data
  )

  return response.data
}

export const deleteRole = async (
  roleId: number
): Promise<void> => {
  await apiClient.delete(`/roles/${roleId}`)
}

export const getRolePermissions = async (
  roleId: number
): Promise<Permission[]> => {
  const response = await apiClient.get<Permission[]>(
  `/roles/${roleId}/permissions`
  )

  return response.data
}

export const assignRolePermission = async (
  roleId: number,
  permissionId: number
): Promise<void> => {
  await apiClient.post(
    `roles/${roleId}/permissions/${permissionId}`
  )
}

export const removeRolePermission = async (
  roleId: number,
  permissionId: number
): Promise<void> => {
  await apiClient.delete(
    `/roles/${roleId}/permissions/${permissionId}`
  )
}