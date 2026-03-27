import { useState } from 'react'
import { GraduationCap } from 'lucide-react'
import { api } from '@/lib/api'
import { fetchAndSaveProfile, saveTokens } from '@/lib/auth'
import { useApiCourseGrid } from '@/hooks/useApiCourseGrid'
import { CourseGridView } from '@/components/courses/CourseGridView'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface PortalPageProps {
  onLogin: () => void
  onLoginPageClick: () => void       // navigate to full login page
  onForgotPassword: () => void
}

export function PortalPage({ onLogin, onLoginPageClick, onForgotPassword }: PortalPageProps) {
  const grid = useApiCourseGrid('catalog')

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    try {
      const res = await api.postAnon<{ access: string; refresh: string }>(
        '/auth/token/',
        { username, password },
      )
      saveTokens(res.access, res.refresh)
      await fetchAndSaveProfile()
      onLogin()
    } catch {
      setError('Invalid credentials.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ── Top header ─────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
            <GraduationCap className="size-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold">AI Academy</span>
        </div>
        <Button onClick={onLoginPageClick} variant="outline" size="sm">
          Sign in
        </Button>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8 flex flex-col gap-8">
        {/* ── Inline login banner ─────────────────────────────────────── */}
        <div className="rounded-xl border bg-muted/30 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-8">
            <div className="flex-1">
              <h2 className="text-xl font-bold">Welcome to AI Academy</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Sign in to enroll in courses, track your progress, and connect with instructors.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-2 sm:flex-row sm:items-center"
            >
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="sm:w-36"
                autoComplete="username"
                required
              />
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="sm:w-36"
                autoComplete="current-password"
                required
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? '…' : 'Sign in'}
              </Button>
            </form>
          </div>

          {error && (
            <p className="mt-3 text-sm text-red-600">
              {error}{' '}
              <button onClick={onForgotPassword} className="underline hover:no-underline">
                Forgot password?
              </button>
            </p>
          )}
        </div>

        {/* ── Public catalog (all clicks redirect to login) ───────────── */}
        <div>
          <h3 className="mb-1 text-lg font-semibold">Course Catalog</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Browse our catalog. Sign in to enroll and access course content.
          </p>

          {/*
            Click-capture overlay: any interaction with the grid redirects to login.
            Positioned absolute so it sits on top of the grid without affecting layout.
          */}
          <div className="relative">
            <div
              className="absolute inset-0 z-10 cursor-pointer"
              onClick={onLoginPageClick}
              aria-label="Sign in to interact with courses"
              title="Sign in to interact with courses"
            />
            <CourseGridView {...grid} />
          </div>
        </div>
      </main>
    </div>
  )
}