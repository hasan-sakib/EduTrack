"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api/client"
import { clearTokens, getAccessToken, setTokens } from "@/lib/auth/token-storage"
import type { AuthResponse, CurrentUser, LoginFormValues } from "@/lib/schemas/auth"

interface AuthContextValue {
  user: CurrentUser | null
  isLoading: boolean
  login: (values: LoginFormValues) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<CurrentUser | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const router = useRouter()

  React.useEffect(() => {
    const token = getAccessToken()
    if (!token) {
      setIsLoading(false)
      return
    }

    apiClient
      .get<CurrentUser>("/auth/me")
      .then((response) => setUser(response.data))
      .catch(() => clearTokens())
      .finally(() => setIsLoading(false))
  }, [])

  const login = React.useCallback(async (values: LoginFormValues) => {
    const response = await apiClient.post<AuthResponse>("/auth/login", values)
    setTokens({ accessToken: response.data.accessToken, refreshToken: response.data.refreshToken })
    setUser(response.data.user)
  }, [])

  const logout = React.useCallback(async () => {
    const refreshToken = typeof window !== "undefined" ? localStorage.getItem("et_refresh_token") : null
    try {
      if (refreshToken) {
        await apiClient.post("/auth/logout", { refreshToken })
      }
    } finally {
      clearTokens()
      setUser(null)
      router.push("/login")
    }
  }, [router])

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const context = React.useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
