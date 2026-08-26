import apiClient from './client'

import type {
  User,
  UserCreate,
  UserListResponse,
  UserUpdate,
} from '../types/user'

export interface GetUsersParams {
  search?: string
  page?: number
  page_size?: number
}

export const getUsers = async (
  params: GetUsersParams = {}
): Promise<UserListResponse> => {
  const response = await apiClient.get<UserListResponse>(
    '/users/',
    { params }
  )

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

export const uploadUserProfileImage = async (
    userId: number,
    file: File
): Promise<User> => {
    const formData = new FormData()

    formData.append('image', file)

    const response = await apiClient.post<User>(
        `/users/${userId}/profile-image`,
        formData
    )

    return response.data
}

export const removeUserProfileImage = async (
    userId: number
): Promise<User> => {
    const response = await apiClient.delete<User>(
        `/users/${userId}/profile-image`
    )

    return response.data
}