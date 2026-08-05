/**
 * Tokens live in localStorage (read by the Axios client) and are mirrored into a
 * plain, non-httpOnly cookie so middleware.ts (Edge runtime, no localStorage access)
 * can gate routes. This trades XSS resistance for avoiding a full BFF/proxy layer —
 * acceptable for this project's scope since access tokens are short-lived (15 min)
 * and the API independently enforces RBAC regardless of what the client believes.
 * See README > Known Limitations.
 */

const ACCESS_TOKEN_KEY = "et_access_token"
const REFRESH_TOKEN_KEY = "et_refresh_token"
const COOKIE_NAME = "et_access_token"

export interface StoredTokens {
  accessToken: string
  refreshToken: string
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function setTokens({ accessToken, refreshToken }: StoredTokens): void {
  if (typeof window === "undefined") return
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  document.cookie = `${COOKIE_NAME}=${accessToken}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`
}

export function clearTokens(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0`
}
