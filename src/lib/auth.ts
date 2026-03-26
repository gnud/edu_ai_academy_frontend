/**
 * JWT token storage with automatic expiry cleanup.
 *
 * Tokens are kept in localStorage under two keys:
 *   - aa_access   — JWT access token string
 *   - aa_refresh  — JWT refresh token string
 *
 * On every read we check the token's `exp` claim; if it has passed we
 * remove both tokens and return null so callers always see clean state.
 */

const KEY_ACCESS  = 'aa_access'
const KEY_REFRESH = 'aa_refresh'

// ── JWT decode ─────────────────────────────────────────────────────────────

export interface JwtPayload {
  exp: number      // Unix timestamp (seconds)
  iat: number
  jti: string
  token_type: 'access' | 'refresh'
  user_id: number
}

export function decodeJwt(token: string): JwtPayload | null {
  try {
    const [, payload] = token.split('.')
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(json) as JwtPayload
  } catch {
    return null
  }
}

function isExpired(token: string): boolean {
  const payload = decodeJwt(token)
  if (!payload) return true
  return Date.now() / 1000 >= payload.exp
}

// ── Storage helpers ────────────────────────────────────────────────────────

export function getAccessToken(): string | null {
  const token = localStorage.getItem(KEY_ACCESS)
  if (!token) return null
  if (isExpired(token)) {
    clearTokens()
    return null
  }
  return token
}

export function getRefreshToken(): string | null {
  const token = localStorage.getItem(KEY_REFRESH)
  if (!token) return null
  if (isExpired(token)) {
    clearTokens()
    return null
  }
  return token
}

export function saveTokens(access: string, refresh: string): void {
  localStorage.setItem(KEY_ACCESS,  access)
  localStorage.setItem(KEY_REFRESH, refresh)
}

export function clearTokens(): void {
  localStorage.removeItem(KEY_ACCESS)
  localStorage.removeItem(KEY_REFRESH)
}

export function isAuthenticated(): boolean {
  return getAccessToken() !== null
}