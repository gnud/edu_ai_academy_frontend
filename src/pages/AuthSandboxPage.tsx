/**
 * Auth Sandbox — developer page to test JWT auth end-to-end.
 *
 * 1. Login form  → POST /api/auth/token/   (stores tokens in localStorage)
 * 2. Token panel → shows decoded payload, expiry countdown, verify button
 * 3. Hub probe   → GET /api/hub/           (uses stored Bearer token)
 * 4. Logout      → clears localStorage tokens
 */

import { useEffect, useRef, useState } from 'react'
import { api, type ApiError } from '@/lib/api'
import {
  clearTokens,
  decodeJwt,
  getAccessToken,
  getRefreshToken,
  isAuthenticated,
  saveTokens,
  type JwtPayload,
} from '@/lib/auth'

// ── Types ──────────────────────────────────────────────────────────────────

interface TokenPair {
  access: string
  refresh: string
}

type RequestStatus = 'idle' | 'loading' | 'ok' | 'error'

interface CallState {
  status: RequestStatus
  data: unknown
  error: string | null
}

const IDLE: CallState = { status: 'idle', data: null, error: null }

// ── Helpers ────────────────────────────────────────────────────────────────

function formatExpiry(exp: number): string {
  return new Date(exp * 1000).toLocaleString()
}

function secondsUntil(exp: number): number {
  return Math.max(0, Math.round(exp - Date.now() / 1000))
}

function fmtCountdown(secs: number): string {
  if (secs <= 0) return 'expired'
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = secs % 60
  if (h > 0) return `${h}h ${m}m ${s}s`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

function tokenPreview(token: string): string {
  const [h, p] = token.split('.')
  return `${h}.${p}.***`
}

// ── Sub-components ─────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: RequestStatus }) {
  const map: Record<RequestStatus, string> = {
    idle:    'bg-muted text-muted-foreground',
    loading: 'bg-blue-100 text-blue-700',
    ok:      'bg-green-100 text-green-700',
    error:   'bg-red-100 text-red-700',
  }
  const label: Record<RequestStatus, string> = {
    idle: 'idle', loading: 'loading…', ok: '200 OK', error: 'error',
  }
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${map[status]}`}>
      {label[status]}
    </span>
  )
}

function JsonBlock({ data }: { data: unknown }) {
  if (data === null) return null
  return (
    <pre className="bg-muted mt-2 max-h-64 overflow-auto rounded-lg p-3 text-xs leading-relaxed">
      {JSON.stringify(data, null, 2)}
    </pre>
  )
}

function SectionCard({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h2>
      {children}
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────

export function AuthSandboxPage() {
  // Login form
  const [username, setUsername] = useState('student')
  const [password, setPassword] = useState('pass')
  const [loginState, setLoginState] = useState<CallState>(IDLE)

  // Token state — re-read from storage after login / logout
  const [accessPayload,  setAccessPayload]  = useState<JwtPayload | null>(null)
  const [refreshPayload, setRefreshPayload] = useState<JwtPayload | null>(null)
  const [countdown, setCountdown] = useState<number>(0)

  // API call states
  const [hubState,    setHubState]    = useState<CallState>(IDLE)
  const [verifyState, setVerifyState] = useState<CallState>(IDLE)
  const [refreshState, setRefreshState] = useState<CallState>(IDLE)

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // ── Sync token state from localStorage ──────────────────────────────────

  function syncTokenState() {
    const access  = getAccessToken()
    const refresh = getRefreshToken()
    setAccessPayload(access  ? decodeJwt(access)  : null)
    setRefreshPayload(refresh ? decodeJwt(refresh) : null)
    if (access) {
      const p = decodeJwt(access)
      setCountdown(p ? secondsUntil(p.exp) : 0)
    } else {
      setCountdown(0)
    }
  }

  // countdown ticker
  useEffect(() => {
    syncTokenState()
    timerRef.current = setInterval(() => {
      syncTokenState()
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  // ── Handlers ────────────────────────────────────────────────────────────

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoginState({ status: 'loading', data: null, error: null })
    try {
      const data = await api.postAnon<TokenPair>('/auth/token/', { username, password })
      saveTokens(data.access, data.refresh)
      syncTokenState()
      setLoginState({ status: 'ok', data, error: null })
    } catch (err) {
      const e = err as ApiError
      setLoginState({ status: 'error', data: null, error: `${e.status} ${e.message}` })
    }
  }

  async function handleVerify() {
    const token = getAccessToken()
    if (!token) return
    setVerifyState({ status: 'loading', data: null, error: null })
    try {
      const data = await api.postAnon<Record<string, unknown>>('/auth/token/verify/', { token })
      setVerifyState({ status: 'ok', data: data ?? { valid: true }, error: null })
    } catch (err) {
      const e = err as ApiError
      setVerifyState({ status: 'error', data: (e as {detail?: unknown}).detail ?? null, error: `${e.status} ${e.message}` })
    }
  }

  async function handleRefresh() {
    const refresh = getRefreshToken()
    if (!refresh) return
    setRefreshState({ status: 'loading', data: null, error: null })
    try {
      const data = await api.postAnon<TokenPair>('/auth/token/refresh/', { refresh })
      saveTokens(data.access, data.refresh)
      syncTokenState()
      setRefreshState({ status: 'ok', data, error: null })
    } catch (err) {
      const e = err as ApiError
      setRefreshState({ status: 'error', data: null, error: `${e.status} ${e.message}` })
    }
  }

  async function handleHub() {
    setHubState({ status: 'loading', data: null, error: null })
    try {
      const data = await api.get<unknown>('/hub/')
      setHubState({ status: 'ok', data, error: null })
    } catch (err) {
      const e = err as ApiError
      setHubState({ status: 'error', data: (e as {detail?: unknown}).detail ?? null, error: `${e.status} ${e.message}` })
    }
  }

  function handleLogout() {
    clearTokens()
    syncTokenState()
    setLoginState(IDLE)
    setHubState(IDLE)
    setVerifyState(IDLE)
    setRefreshState(IDLE)
  }

  const loggedIn = isAuthenticated()

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-1">

      {/* ── 1. Login ──────────────────────────────────────────────────── */}
      <SectionCard title="1 · Login — POST /api/auth/token/">
        <form onSubmit={handleLogin} className="flex flex-col gap-3">
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={loginState.status === 'loading'}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
            >
              {loginState.status === 'loading' ? 'Logging in…' : 'Login'}
            </button>
            {loggedIn && (
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-muted"
              >
                Logout &amp; clear tokens
              </button>
            )}
            <StatusBadge status={loginState.status} />
            {loginState.error && (
              <span className="text-sm text-red-600">{loginState.error}</span>
            )}
          </div>
        </form>

        {loginState.status === 'ok' && (
          <div className="mt-3">
            <p className="text-xs text-muted-foreground mb-1">Response tokens (stored in localStorage):</p>
            <JsonBlock data={loginState.data} />
          </div>
        )}
      </SectionCard>

      {/* ── 2. Token info ─────────────────────────────────────────────── */}
      <SectionCard title="2 · Token state (localStorage)">
        {!accessPayload ? (
          <p className="text-sm text-muted-foreground">No valid access token in storage.</p>
        ) : (
          <div className="space-y-4">
            {/* Access token */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold">Access token</span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${countdown > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {countdown > 0 ? `expires in ${fmtCountdown(countdown)}` : 'expired'}
                </span>
              </div>
              <code className="block truncate rounded bg-muted px-2 py-1 text-xs">
                {tokenPreview(getAccessToken()!)}
              </code>
              <table className="mt-2 w-full text-xs">
                <tbody>
                  <tr><td className="text-muted-foreground pr-4 py-0.5">user_id</td><td>{accessPayload.user_id}</td></tr>
                  <tr><td className="text-muted-foreground pr-4 py-0.5">issued at</td><td>{formatExpiry(accessPayload.iat)}</td></tr>
                  <tr><td className="text-muted-foreground pr-4 py-0.5">expires at</td><td>{formatExpiry(accessPayload.exp)}</td></tr>
                  <tr><td className="text-muted-foreground pr-4 py-0.5">jti</td><td className="font-mono">{accessPayload.jti}</td></tr>
                </tbody>
              </table>
            </div>

            {/* Refresh token */}
            {refreshPayload && (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold">Refresh token</span>
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                    expires {formatExpiry(refreshPayload.exp)}
                  </span>
                </div>
                <code className="block truncate rounded bg-muted px-2 py-1 text-xs">
                  {tokenPreview(getRefreshToken()!)}
                </code>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                onClick={handleVerify}
                disabled={verifyState.status === 'loading'}
                className="rounded-lg border px-3 py-1.5 text-xs font-medium transition hover:bg-muted disabled:opacity-50"
              >
                Verify access token
              </button>
              <button
                onClick={handleRefresh}
                disabled={refreshState.status === 'loading'}
                className="rounded-lg border px-3 py-1.5 text-xs font-medium transition hover:bg-muted disabled:opacity-50"
              >
                Refresh token
              </button>
              <StatusBadge status={verifyState.status} />
            </div>
            {verifyState.error && <p className="text-xs text-red-600">{verifyState.error}</p>}
            <JsonBlock data={verifyState.data} />
            {refreshState.status !== 'idle' && (
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium">Refresh result</span>
                  <StatusBadge status={refreshState.status} />
                  {refreshState.error && <span className="text-xs text-red-600">{refreshState.error}</span>}
                </div>
                <JsonBlock data={refreshState.data} />
              </div>
            )}
          </div>
        )}
      </SectionCard>

      {/* ── 3. Hub probe ──────────────────────────────────────────────── */}
      <SectionCard title="3 · Hub probe — GET /api/hub/">
        <div className="flex items-center gap-3">
          <button
            onClick={handleHub}
            disabled={hubState.status === 'loading' || !loggedIn}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
          >
            {hubState.status === 'loading' ? 'Fetching…' : 'Fetch hub'}
          </button>
          <StatusBadge status={hubState.status} />
          {hubState.error && <span className="text-sm text-red-600">{hubState.error}</span>}
          {!loggedIn && (
            <span className="text-xs text-muted-foreground">Login first to enable this call.</span>
          )}
        </div>
        <JsonBlock data={hubState.data} />
      </SectionCard>

    </div>
  )
}