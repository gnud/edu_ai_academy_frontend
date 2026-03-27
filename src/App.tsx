import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { DashboardPage } from '@/pages/DashboardPage'
import { CoursesPage } from '@/pages/CoursesPage'
import { CatalogPage } from '@/pages/CatalogPage'
import { AuthSandboxPage } from '@/pages/AuthSandboxPage'
import { InboxPage } from '@/pages/InboxPage'
import { LoginPage } from '@/pages/LoginPage'
import { ResetPasswordPage } from '@/pages/ResetPasswordPage'
import { ConfirmPasswordPage } from '@/pages/ConfirmPasswordPage'
import { PortalPage } from '@/pages/PortalPage'
import { clearTokens, isAuthenticated } from '@/lib/auth'

// ── Authenticated pages ────────────────────────────────────────────────────

export type PageId =
  | 'dashboard'
  | 'courses'
  | 'catalog'
  | 'live-classes'
  | 'messages'
  | 'groups'
  | 'ai-tutor'
  | 'auth-sandbox'

const PAGE_TITLES: Record<PageId, string> = {
  dashboard:    'Dashboard',
  courses:      'My Courses',
  catalog:      'Course Catalog',
  'live-classes': 'Live Classes',
  messages:     'Messages',
  groups:       'Study Groups',
  'ai-tutor':   'AI Tutor',
  'auth-sandbox': 'Auth Sandbox',
}

function PageContent({ page }: { page: PageId }) {
  switch (page) {
    case 'dashboard':    return <DashboardPage />
    case 'courses':      return <CoursesPage />
    case 'catalog':      return <CatalogPage />
    case 'messages':     return <InboxPage />
    case 'auth-sandbox': return <AuthSandboxPage />
    default:
      return (
        <div className="flex flex-col gap-4">
          <div className="bg-muted/50 min-h-96 flex-1 rounded-xl" />
        </div>
      )
  }
}

// ── Guest / auth flow pages ────────────────────────────────────────────────

type AuthView = 'portal' | 'login' | 'reset-password' | 'confirm-password'

/** Detect reset-password confirmation link on initial load. */
function detectInitialAuthView(): AuthView {
  const p = new URLSearchParams(window.location.search)
  if (p.get('token') && p.get('uid')) return 'confirm-password'
  return 'portal'
}

// ── Root ───────────────────────────────────────────────────────────────────

function App() {
  const [isAuth, setIsAuth] = useState<boolean>(isAuthenticated)
  const [page,   setPage]   = useState<PageId>('dashboard')
  const [authView, setAuthView] = useState<AuthView>(detectInitialAuthView)

  function handleLogin() {
    setIsAuth(true)
    setPage('dashboard')
  }

  function handleLogout() {
    clearTokens()
    setIsAuth(false)
    setAuthView('portal')
  }

  // ── Authenticated shell ──────────────────────────────────────────────────
  if (isAuth) {
    return (
      <DashboardLayout
        title={PAGE_TITLES[page]}
        activePage={page}
        onNavigate={setPage}
        onLogout={handleLogout}
      >
        <PageContent page={page} />
      </DashboardLayout>
    )
  }

  // ── Guest views ──────────────────────────────────────────────────────────
  switch (authView) {
    case 'login':
      return (
        <LoginPage
          onLogin={handleLogin}
          onForgotPassword={() => setAuthView('reset-password')}
          onPortal={() => setAuthView('portal')}
        />
      )

    case 'reset-password':
      return (
        <ResetPasswordPage onBack={() => setAuthView('login')} />
      )

    case 'confirm-password':
      return (
        <ConfirmPasswordPage onBack={() => setAuthView('login')} />
      )

    default: // 'portal'
      return (
        <PortalPage
          onLogin={handleLogin}
          onLoginPageClick={() => setAuthView('login')}
          onForgotPassword={() => setAuthView('reset-password')}
        />
      )
  }
}

export default App