import { useState } from 'react'
import { GraduationCap } from 'lucide-react'
import { api } from '@/lib/api'
import { fetchAndSaveProfile, saveTokens } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import heroImg from '@/assets/hero.png'

interface LoginPageProps {
  onLogin: () => void
  onForgotPassword: () => void
  onPortal: () => void
}

export function LoginPage({ onLogin, onForgotPassword, onPortal }: LoginPageProps) {
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
    } catch (err: unknown) {
      const detail = (err as { detail?: { detail?: string } })?.detail?.detail
      setError(detail ?? 'Invalid credentials. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* ── Left brand panel ─────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-primary p-12 text-primary-foreground">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary-foreground/10">
            <GraduationCap className="size-5" />
          </div>
          <span className="text-xl font-bold">AI Academy</span>
        </div>

        <div className="flex justify-center">
          <img src={heroImg} alt="" className="max-w-xs opacity-90 drop-shadow-2xl" />
        </div>

        <blockquote className="text-lg font-medium leading-relaxed opacity-90">
          "The future of learning is here — personalised, intelligent, and always available."
        </blockquote>
      </div>

      {/* ── Right form panel ─────────────────────────────────────────── */}
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <GraduationCap className="size-6 text-primary" />
            <span className="font-bold">AI Academy</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold">Welcome back</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Sign in to your account to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="username" className="text-sm font-medium">
                Username
              </label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="your-username"
                autoComplete="username"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <button
                  type="button"
                  onClick={onForgotPassword}
                  className="text-xs text-primary hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </div>

            {error && (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/20">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={onPortal}
              className="text-sm text-muted-foreground hover:text-foreground hover:underline"
            >
              ← Back to portal
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}