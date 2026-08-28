import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'

import {
  getCurrentUser,
  login as loginApi,
  logout as logoutApi,
} from '../api/auth'

import type {
  LoginRequest,
  User,
} from '../types/auth'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  hasPermission: (permission: string) => boolean
  login: (data: LoginRequest) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isAuthenticated = user !== null

  const hasPermission = (permission: string): boolean =>
    user?.permissions?.includes(permission) ?? false

  useEffect(() => {
    const loadCurrentUser = async () => {
      const accessToken = localStorage.getItem(
        'access_token'
      )

      if (!accessToken) {
        setIsLoading(false)
        return
      }

      try {
        const currentUser = await getCurrentUser()

        setUser(currentUser)
      } catch {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    loadCurrentUser()
  }, [])

  const login = async (
    data: LoginRequest
  ): Promise<void> => {
    const tokens = await loginApi(data)

    localStorage.setItem(
      'access_token',
      tokens.access_token
    )

    localStorage.setItem(
      'refresh_token',
      tokens.refresh_token
    )

    const currentUser = await getCurrentUser()

    setUser(currentUser)
  }

  const logout = async (): Promise<void> => {
    try {
      await logoutApi()
    } finally {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        hasPermission,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error(
      'useAuth must be used inside AuthProvider'
    )
  }

  return context
}