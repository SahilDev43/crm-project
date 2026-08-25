import apiClient from './client'
import type { Role } from '../types/role'

export const getRoles = async (): Promise<Role[]> => {
  const response = await apiClient.get<Role[]>('/roles/')

  return response.data
}