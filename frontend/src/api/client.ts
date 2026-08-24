import axios from 'axios'

const apiClient = axios.create({
    baseURL: 'http://127.0.0.1:8000/api/v1',
})

/**
 * Uploaded files are stored as paths relative to the API server.  Resolve
 * those paths before using them in the frontend, which runs on a different
 * origin during development.
 */
export const getAssetUrl = (path: string): string => {
    if (/^https?:\/\//i.test(path)) {
        return path
    }

    const baseUrl = apiClient.defaults.baseURL

    if (!baseUrl) {
        return path
    }

    const apiOrigin = new URL(baseUrl).origin
    const assetPath = path.startsWith('/') ? path : `/${path}`

    return new URL(assetPath, apiOrigin).toString()
}

apiClient.interceptors.request.use((config) => {
    const accessToken = localStorage.getItem('access_token')

    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`
    }

    return config
})

export default apiClient
