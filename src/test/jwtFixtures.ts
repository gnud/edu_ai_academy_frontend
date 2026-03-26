/**
 * Helpers for building real-looking JWT strings in tests.
 *
 * We build the header + payload parts properly (base64url encoded JSON)
 * but use a fake signature — the auth.ts module only decodes the payload,
 * it never verifies the signature, so this is sufficient for unit tests.
 */

function b64url(obj: object): string {
  return btoa(JSON.stringify(obj))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

const HEADER = b64url({ alg: 'HS256', typ: 'JWT' })
const FAKE_SIG = 'fakesignature'

export function makeToken(overrides: {
  exp?: number
  iat?: number
  user_id?: number
  token_type?: 'access' | 'refresh'
  jti?: string
}): string {
  const now = Math.floor(Date.now() / 1000)
  const payload = {
    exp: now + 3600,
    iat: now,
    jti: 'test-jti-abc123',
    token_type: 'access' as const,
    user_id: 1,
    ...overrides,
  }
  return `${HEADER}.${b64url(payload)}.${FAKE_SIG}`
}

/** A token that expired 1 second ago. */
export function expiredToken(type: 'access' | 'refresh' = 'access'): string {
  const now = Math.floor(Date.now() / 1000)
  return makeToken({ exp: now - 1, token_type: type })
}

/** A token that expires in 1 hour. */
export function validAccessToken(): string {
  return makeToken({ token_type: 'access' })
}

/** A refresh token that expires in 7 days. */
export function validRefreshToken(): string {
  const now = Math.floor(Date.now() / 1000)
  return makeToken({ exp: now + 7 * 86400, token_type: 'refresh' })
}