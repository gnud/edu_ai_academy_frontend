import { useState } from 'react'
import { GraduationCap } from 'lucide-react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface ConfirmPasswordPageProps {
  onBack: () => void  // back to login after success or invalid link
}

export function ConfirmPasswordPage({ onBack }: ConfirmPasswordPageProps) {
  const params = new URLSearchParams(window.location.search)
  const token = params.get('token') ?? ''
  const uid   = params.get('uid')   ?? ''

  const [password,  setPassword]  = useState('')
  const [password2, setPassword2] = useState('')
  const [done,      setDone]      = useState(false)
  const [error,     setError]     = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== password2) {
      setError('Passwords do not match.')
      return
    }
    setError(null)
    setIsLoading(true)
    try {
      await api.postAnon('/auth/password/reset/confirm/', {
        token,
        uid,
        new_password1: password,
        new_password2: password2,
      })
      setDone(true)
    } catch {
      setError('Link may be expired or invalid. Request a new reset link.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex items-center gap-2">
          <GraduationCap className="size-6 text-primary" />
          <span className="font-bold">AI Academy</span>
        </div>

        {/* Missing params guard */}
        {(!token || !uid) ? (
          <div className="text-center">
            <div className="mb-4 text-5xl">🔗</div>
            <h1 className="mb-2 text-xl font-bold">Invalid reset link</h1>
            <p className="mb-6 text-sm text-muted-foreground">
              This link is missing required parameters. Request a new reset link.
            </p>
            <Button onClick={onBack} variant="outline" className="w-full">
              Back to login
            </Button>
          </div>
        ) : done ? (
          <div className="text-center">
            <div className="mb-4 text-5xl">✅</div>
            <h1 className="mb-2 text-xl font-bold">Password updated</h1>
            <p className="mb-6 text-sm text-muted-foreground">
              Your password has been reset. You can now sign in with your new password.
            </p>
            <Button onClick={onBack} className="w-full">
              Sign in
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-bold">Set new password</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Choose a strong password for your account.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="password" className="text-sm font-medium">
                  New password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="password2" className="text-sm font-medium">
                  Confirm password
                </label>
                <Input
                  id="password2"
                  type="password"
                  value={password2}
                  onChange={(e) => setPassword2(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                />
              </div>

              {error && (
                <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/20">
                  {error}
                </p>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Saving…' : 'Reset password'}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}