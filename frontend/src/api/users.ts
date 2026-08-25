import apiClient from './client'

import type {
  User,
  UserCreate,
  UserUpdate,
} from '../types/user'

export const getUsers = async (): Promise<User[]> => {
  const response = await apiClient.get<User[]>('/users/')

  return response.data
}

export const getUser = async (
  userId: number
): Promise<User> => {
  const response = await apiClient.get<User>(
    `/users/${userId}`
  )

  return response.data
}

export const createUser = async (
  data: UserCreate
): Promise<User> => {
  const response = await apiClient.post<User>(
    '/users/',
    data
  )

  return response.data
}

export const updateUser = async (
  userId: number,
  data: UserUpdate
): Promise<User> => {
  const response = await apiClient.patch<User>(
    `/users/${userId}`,
    data
  )

  return response.data
}

export const deleteUser = async (
  userId: number
): Promise<void> => {
  await apiClient.delete(
    `/users/${userId}`
  )
}