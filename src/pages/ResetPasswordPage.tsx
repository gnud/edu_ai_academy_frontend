import { useState } from 'react'
import { GraduationCap } from 'lucide-react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface ResetPasswordPageProps {
  onBack: () => void  // back to login
}

export function ResetPasswordPage({ onBack }: ResetPasswordPageProps) {
  const [username, setUsername] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    try {
      await api.postAnon('/auth/password/reset/', { username })
      setSent(true)
    } catch {
      setError('Something went wrong. Please try again.')
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

        {sent ? (
          <div className="text-center">
            <div className="mb-4 text-5xl">📬</div>
            <h1 className="mb-2 text-xl font-bold">Check your inbox</h1>
            <p className="mb-6 text-sm text-muted-foreground">
              We've sent a password reset link to the email associated with <strong>{username}</strong>.
              Check your spam folder if you don't see it.
            </p>
            <Button variant="outline" onClick={onBack} className="w-full">
              Back to login
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-bold">Reset your password</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Enter your username and we'll send a reset link to your email.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="username" className="text-sm font-medium">
                  Username
                </label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="your-username"
                  autoComplete="username"
                  required
                />
              </div>

              {error && (
                <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/20">
                  {error}
                </p>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Sending…' : 'Send reset link'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={onBack}
                className="text-sm text-muted-foreground hover:text-foreground hover:underline"
              >
                ← Back to login
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}