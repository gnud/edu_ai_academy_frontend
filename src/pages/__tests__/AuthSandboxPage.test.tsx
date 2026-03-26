/**
 * Component tests for AuthSandboxPage.
 *
 * The `api` module is mocked so no real network calls are made.
 * localStorage is cleared before each test.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthSandboxPage } from '@/pages/AuthSandboxPage'
import { clearTokens, saveTokens } from '@/lib/auth'
import { validAccessToken, validRefreshToken } from '@/test/jwtFixtures'

// ── Mock the api module ────────────────────────────────────────────────────

vi.mock('@/lib/api', () => ({
  api: {
    postAnon: vi.fn(),
    get: vi.fn(),
  },
}))

import { api } from '@/lib/api'
const mockApi = api as {
  postAnon: ReturnType<typeof vi.fn>
  get: ReturnType<typeof vi.fn>
}

// ── Setup ──────────────────────────────────────────────────────────────────

beforeEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
})

// ── Helpers ────────────────────────────────────────────────────────────────

function setup() {
  const user = userEvent.setup()
  render(<AuthSandboxPage />)
  return { user }
}

async function loginAs(user: ReturnType<typeof userEvent.setup>, username = 'student', password = 'pass') {
  const usernameInput = screen.getByPlaceholderText('Username')
  const passwordInput = screen.getByPlaceholderText('Password')
  await user.clear(usernameInput)
  await user.type(usernameInput, username)
  await user.clear(passwordInput)
  await user.type(passwordInput, password)
  await user.click(screen.getByRole('button', { name: /login/i }))
}

// ── Rendering ──────────────────────────────────────────────────────────────

describe('initial render', () => {
  it('shows the login form', () => {
    setup()
    expect(screen.getByPlaceholderText('Username')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument()
  })

  it('pre-fills username with "student"', () => {
    setup()
    expect(screen.getByPlaceholderText('Username')).toHaveValue('student')
  })

  it('disables the Fetch hub button when not logged in', () => {
    setup()
    expect(screen.getByRole('button', { name: /fetch hub/i })).toBeDisabled()
  })

  it('shows "No valid access token" message when storage is empty', () => {
    setup()
    expect(screen.getByText(/no valid access token/i)).toBeInTheDocument()
  })
})

// ── Successful login ───────────────────────────────────────────────────────

describe('successful login', () => {
  beforeEach(() => {
    mockApi.postAnon.mockResolvedValue({
      access:  validAccessToken(),
      refresh: validRefreshToken(),
    })
  })

  it('calls POST /auth/token/ with the entered credentials', async () => {
    const { user } = setup()
    await loginAs(user, 'alice', 'secret')
    expect(mockApi.postAnon).toHaveBeenCalledWith(
      '/auth/token/',
      { username: 'alice', password: 'secret' },
    )
  })

  it('shows 200 OK badge after login', async () => {
    const { user } = setup()
    await loginAs(user)
    await waitFor(() => expect(screen.getByText('200 OK')).toBeInTheDocument())
  })

  it('stores tokens in localStorage', async () => {
    const { user } = setup()
    await loginAs(user)
    await waitFor(() => {
      expect(localStorage.getItem('aa_access')).not.toBeNull()
      expect(localStorage.getItem('aa_refresh')).not.toBeNull()
    })
  })

  it('reveals the Logout button after login', async () => {
    const { user } = setup()
    await loginAs(user)
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument()
    )
  })

  it('enables the Fetch hub button after login', async () => {
    const { user } = setup()
    await loginAs(user)
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /fetch hub/i })).not.toBeDisabled()
    )
  })

  it('shows token info panel after login', async () => {
    const { user } = setup()
    await loginAs(user)
    await waitFor(() =>
      expect(screen.getByText('Access token')).toBeInTheDocument()
    )
  })
})

// ── Failed login ───────────────────────────────────────────────────────────

describe('failed login', () => {
  it('shows error message on 401', async () => {
    mockApi.postAnon.mockRejectedValue({ status: 401, message: 'Unauthorized' })
    const { user } = setup()
    await loginAs(user, 'student', 'wrongpass')
    await waitFor(() =>
      expect(screen.getByText(/401 Unauthorized/i)).toBeInTheDocument()
    )
  })

  it('shows error badge on failure', async () => {
    mockApi.postAnon.mockRejectedValue({ status: 401, message: 'Unauthorized' })
    const { user } = setup()
    await loginAs(user)
    await waitFor(() => expect(screen.getByText('error')).toBeInTheDocument())
  })

  it('does not store tokens on failed login', async () => {
    mockApi.postAnon.mockRejectedValue({ status: 401, message: 'Unauthorized' })
    const { user } = setup()
    await loginAs(user)
    await waitFor(() => screen.getByText(/401/i))
    expect(localStorage.getItem('aa_access')).toBeNull()
  })

  it('keeps Fetch hub button disabled after failed login', async () => {
    mockApi.postAnon.mockRejectedValue({ status: 401, message: 'Unauthorized' })
    const { user } = setup()
    await loginAs(user)
    await waitFor(() => screen.getByText(/401/i))
    expect(screen.getByRole('button', { name: /fetch hub/i })).toBeDisabled()
  })
})

// ── Hub probe ─────────────────────────────────────────────────────────────

describe('hub probe', () => {
  const hubResponse = {
    stats: { in_the_mix: 2, on_deck: 1, graduated: 3, dropped: 0 },
    upcoming_classes: [],
    scheduled: [],
    archive: [],
  }

  beforeEach(async () => {
    // Pre-load tokens so the page renders as logged-in
    saveTokens(validAccessToken(), validRefreshToken())
    mockApi.get.mockResolvedValue(hubResponse)
  })

  it('calls GET /hub/ when Fetch hub is clicked', async () => {
    const { user } = setup()
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /fetch hub/i })).not.toBeDisabled()
    )
    await user.click(screen.getByRole('button', { name: /fetch hub/i }))
    expect(mockApi.get).toHaveBeenCalledWith('/hub/')
  })

  it('shows 200 OK badge after successful hub call', async () => {
    const { user } = setup()
    await user.click(screen.getByRole('button', { name: /fetch hub/i }))
    await waitFor(() => {
      const badges = screen.getAllByText('200 OK')
      expect(badges.length).toBeGreaterThan(0)
    })
  })

  it('renders hub JSON response in the page', async () => {
    const { user } = setup()
    await user.click(screen.getByRole('button', { name: /fetch hub/i }))
    await waitFor(() =>
      expect(screen.getByText(/"in_the_mix": 2/)).toBeInTheDocument()
    )
  })

  it('shows error on hub 401', async () => {
    mockApi.get.mockRejectedValue({ status: 401, message: 'Unauthorized' })
    const { user } = setup()
    await user.click(screen.getByRole('button', { name: /fetch hub/i }))
    await waitFor(() =>
      expect(screen.getByText(/401 Unauthorized/i)).toBeInTheDocument()
    )
  })
})

// ── Logout ────────────────────────────────────────────────────────────────

describe('logout', () => {
  beforeEach(() => {
    saveTokens(validAccessToken(), validRefreshToken())
    mockApi.postAnon.mockResolvedValue({
      access:  validAccessToken(),
      refresh: validRefreshToken(),
    })
  })

  it('clears localStorage on logout', async () => {
    const { user } = setup()
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument()
    )
    await user.click(screen.getByRole('button', { name: /logout/i }))
    expect(localStorage.getItem('aa_access')).toBeNull()
    expect(localStorage.getItem('aa_refresh')).toBeNull()
  })

  it('hides the token panel after logout', async () => {
    const { user } = setup()
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument()
    )
    await user.click(screen.getByRole('button', { name: /logout/i }))
    await waitFor(() =>
      expect(screen.getByText(/no valid access token/i)).toBeInTheDocument()
    )
  })

  it('disables Fetch hub again after logout', async () => {
    const { user } = setup()
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument()
    )
    await user.click(screen.getByRole('button', { name: /logout/i }))
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /fetch hub/i })).toBeDisabled()
    )
  })
})