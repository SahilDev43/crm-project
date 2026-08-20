import apiClient from './client'

import type {
    LoginRequest,
    TokenResponse,
    User
} from '../types/auth'

export const login = async (
    data: LoginRequest
): Promise<TokenResponse> => {
    const response = await apiClient.post<TokenResponse>(
        'auth/login',
        data
    )

    return response.data
}

export const getCurrentUser = async (): Promise<User> => {
    const response = await apiClient.get<User>(
        '/auth/me'
    )

    return response.data
}

export const logout = async () => {
    await apiClient.post('/auth/logout')
}