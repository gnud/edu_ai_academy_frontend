/**
 * Thin fetch wrapper for the Django REST API.
 *
 * In development:  requests go to `/api/*` which Vite proxies to VITE_API_URL
 *                  (avoids CORS entirely — browser talks only to Vite's dev server).
 *
 * In production:   VITE_API_URL is inlined at build time as the fetch base URL,
 *                  so requests go directly to the Django server.
 */

import { getAccessToken } from '@/lib/auth'

const BASE =
  import.meta.env.DEV
    ? '/api'
    : `${import.meta.env.VITE_API_URL}/api`

export type ApiError = {
  status: number
  message: string
  detail?: unknown
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    if (res.status === 401) {
      window.dispatchEvent(new Event('auth:expired'))
    }
    let detail: unknown
    try { detail = await res.json() } catch { /* non-JSON error body */ }
    throw { status: res.status, message: res.statusText, detail } satisfies ApiError
  }
  // 204 No Content
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

function buildHeaders(init?: HeadersInit, withAuth = true): HeadersInit {
  const token = withAuth ? getAccessToken() : null
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...init,
  }
}

export const api = {
  get<T>(path: string, init?: RequestInit): Promise<T> {
    return fetch(`${BASE}${path}`, {
      ...init,
      method: 'GET',
      headers: buildHeaders(init?.headers),
    }).then(handleResponse<T>)
  },

  /** POST without auto-injecting the Bearer token (for auth endpoints). */
  postAnon<T>(path: string, body: unknown, init?: RequestInit): Promise<T> {
    return fetch(`${BASE}${path}`, {
      ...init,
      method: 'POST',
      headers: buildHeaders(init?.headers, false),
      body: JSON.stringify(body),
    }).then(handleResponse<T>)
  },

  post<T>(path: string, body: unknown, init?: RequestInit): Promise<T> {
    return fetch(`${BASE}${path}`, {
      ...init,
      method: 'POST',
      headers: buildHeaders(init?.headers),
      body: JSON.stringify(body),
    }).then(handleResponse<T>)
  },

  patch<T>(path: string, body: unknown, init?: RequestInit): Promise<T> {
    return fetch(`${BASE}${path}`, {
      ...init,
      method: 'PATCH',
      headers: buildHeaders(init?.headers),
      body: JSON.stringify(body),
    }).then(handleResponse<T>)
  },

  put<T>(path: string, body: unknown, init?: RequestInit): Promise<T> {
    return fetch(`${BASE}${path}`, {
      ...init,
      method: 'PUT',
      headers: buildHeaders(init?.headers),
      body: JSON.stringify(body),
    }).then(handleResponse<T>)
  },

  postForm<T>(path: string, form: FormData, init?: RequestInit): Promise<T> {
    const token = getAccessToken()
    return fetch(`${BASE}${path}`, {
      ...init,
      method: 'POST',
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...init?.headers },
      body: form,
    }).then(handleResponse<T>)
  },

  delete<T = void>(path: string, init?: RequestInit): Promise<T> {
    return fetch(`${BASE}${path}`, {
      ...init,
      method: 'DELETE',
      headers: buildHeaders(init?.headers),
    }).then(handleResponse<T>)
  },
}