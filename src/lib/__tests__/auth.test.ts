/**
 * Unit tests for src/lib/auth.ts
 *
 * Covers: decodeJwt, getAccessToken, getRefreshToken, saveTokens,
 *         clearTokens, isAuthenticated — including expiry auto-cleanup.
 */

import { beforeEach, describe, expect, it } from 'vitest'
import {
  clearTokens,
  decodeJwt,
  getAccessToken,
  getRefreshToken,
  isAuthenticated,
  saveTokens,
} from '@/lib/auth'
import {
  expiredToken,
  makeToken,
  validAccessToken,
  validRefreshToken,
} from '@/test/jwtFixtures'

const KEY_ACCESS  = 'aa_access'
const KEY_REFRESH = 'aa_refresh'

beforeEach(() => localStorage.clear())

// ── decodeJwt ──────────────────────────────────────────────────────────────

describe('decodeJwt', () => {
  it('returns the payload of a well-formed token', () => {
    const token = validAccessToken()
    const payload = decodeJwt(token)
    expect(payload).not.toBeNull()
    expect(payload!.token_type).toBe('access')
    expect(payload!.user_id).toBe(1)
    expect(payload!.exp).toBeGreaterThan(Date.now() / 1000)
  })

  it('returns null for a completely invalid string', () => {
    expect(decodeJwt('not.a.jwt')).toBeNull()
  })

  it('returns null for an empty string', () => {
    expect(decodeJwt('')).toBeNull()
  })

  it('decodes custom claims correctly', () => {
    const now = Math.floor(Date.now() / 1000)
    const token = makeToken({ user_id: 42, exp: now + 9999, jti: 'my-jti' })
    const payload = decodeJwt(token)
    expect(payload!.user_id).toBe(42)
    expect(payload!.jti).toBe('my-jti')
  })
})

// ── saveTokens / clearTokens ───────────────────────────────────────────────

describe('saveTokens', () => {
  it('writes both tokens to localStorage', () => {
    const access  = validAccessToken()
    const refresh = validRefreshToken()
    saveTokens(access, refresh)
    expect(localStorage.getItem(KEY_ACCESS)).toBe(access)
    expect(localStorage.getItem(KEY_REFRESH)).toBe(refresh)
  })
})

describe('clearTokens', () => {
  it('removes both tokens from localStorage', () => {
    saveTokens(validAccessToken(), validRefreshToken())
    clearTokens()
    expect(localStorage.getItem(KEY_ACCESS)).toBeNull()
    expect(localStorage.getItem(KEY_REFRESH)).toBeNull()
  })

  it('is a no-op when storage is already empty', () => {
    expect(() => clearTokens()).not.toThrow()
  })
})

// ── getAccessToken ─────────────────────────────────────────────────────────

describe('getAccessToken', () => {
  it('returns null when nothing is stored', () => {
    expect(getAccessToken()).toBeNull()
  })

  it('returns the token when it is valid', () => {
    const token = validAccessToken()
    saveTokens(token, validRefreshToken())
    expect(getAccessToken()).toBe(token)
  })

  it('returns null and clears storage when the access token is expired', () => {
    saveTokens(expiredToken('access'), validRefreshToken())
    expect(getAccessToken()).toBeNull()
    expect(localStorage.getItem(KEY_ACCESS)).toBeNull()
    expect(localStorage.getItem(KEY_REFRESH)).toBeNull()
  })

  it('returns null for a malformed token string in storage', () => {
    localStorage.setItem(KEY_ACCESS, 'garbage')
    expect(getAccessToken()).toBeNull()
  })
})

// ── getRefreshToken ────────────────────────────────────────────────────────

describe('getRefreshToken', () => {
  it('returns null when nothing is stored', () => {
    expect(getRefreshToken()).toBeNull()
  })

  it('returns the token when it is valid', () => {
    const refresh = validRefreshToken()
    saveTokens(validAccessToken(), refresh)
    expect(getRefreshToken()).toBe(refresh)
  })

  it('returns null and clears storage when the refresh token is expired', () => {
    saveTokens(validAccessToken(), expiredToken('refresh'))
    expect(getRefreshToken()).toBeNull()
    expect(localStorage.getItem(KEY_REFRESH)).toBeNull()
  })
})

// ── isAuthenticated ────────────────────────────────────────────────────────

describe('isAuthenticated', () => {
  it('returns false when no token is stored', () => {
    expect(isAuthenticated()).toBe(false)
  })

  it('returns true when a valid access token is stored', () => {
    saveTokens(validAccessToken(), validRefreshToken())
    expect(isAuthenticated()).toBe(true)
  })

  it('returns false after the access token expires', () => {
    saveTokens(expiredToken('access'), validRefreshToken())
    expect(isAuthenticated()).toBe(false)
  })

  it('returns false after clearTokens()', () => {
    saveTokens(validAccessToken(), validRefreshToken())
    clearTokens()
    expect(isAuthenticated()).toBe(false)
  })
})