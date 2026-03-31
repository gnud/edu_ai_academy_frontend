import { useEffect, useState } from 'react'
import { Calendar, Users } from 'lucide-react'
import { api } from '@/lib/api'
import {
  fetchAndSaveProfile,
  getProfile,
  saveProfile,
  type UserProfile,
} from '@/lib/auth'
import {
  mapMyCourseItem,
  type ApiMyCourseItem,
  type ApiPage,
} from '@/lib/courseApi'
import type { Course } from '@/data/courses'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'

// ── helpers ─────────────────────────────────────────────────────────────────

function initials(profile: UserProfile | null) {
  if (!profile) return '?'
  const name = profile.display_name || profile.full_name || profile.username
  return name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <h2 className="mb-5 text-base font-semibold">{title}</h2>
      {children}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium">{label}</label>
      {children}
    </div>
  )
}

function Feedback({ ok, msg }: { ok: boolean; msg: string }) {
  return (
    <p className={`text-sm ${ok ? 'text-green-600' : 'text-red-600'}`}>{msg}</p>
  )
}

// ── Section 1: Basic profile ─────────────────────────────────────────────────

function ProfileForm({ profile, onSaved }: { profile: UserProfile; onSaved: (p: UserProfile) => void }) {
  const [firstName,   setFirstName]   = useState(profile.full_name.split(' ')[0] ?? '')
  const [lastName,    setLastName]    = useState(profile.full_name.split(' ').slice(1).join(' ') ?? '')
  const [displayName, setDisplayName] = useState(profile.display_name)
  const [bio,         setBio]         = useState('')
  const [isSaving,    setIsSaving]    = useState(false)
  const [feedback,    setFeedback]    = useState<{ ok: boolean; msg: string } | null>(null)

  // Load bio from API (not stored in localStorage profile)
  useEffect(() => {
    api.get<UserProfile & { bio?: string }>('/accounts/me/')
      .then((data) => setBio((data as unknown as { bio: string }).bio ?? ''))
      .catch(() => {})
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFeedback(null)
    setIsSaving(true)
    try {
      const updated = await api.patch<UserProfile>('/accounts/me/', {
        first_name: firstName,
        last_name: lastName,
        display_name: displayName,
        bio,
      })
      saveProfile(updated)
      onSaved(updated)
      setFeedback({ ok: true, msg: 'Profile saved.' })
    } catch {
      setFeedback({ ok: false, msg: 'Failed to save. Please try again.' })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Avatar */}
      <div className="flex items-center gap-4">
        <Avatar className="size-16 text-xl">
          <AvatarFallback>{initials(profile)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold">{profile.display_name || profile.username}</p>
          <p className="text-sm text-muted-foreground">@{profile.username}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="First name">
          <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        </Field>
        <Field label="Last name">
          <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
        </Field>
      </div>

      <Field label="Display name">
        <Input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="How you appear to others"
        />
      </Field>

      <Field label="Bio">
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          placeholder="A short bio about yourself…"
          className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
        />
      </Field>

      {feedback && <Feedback {...feedback} />}

      <div>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? 'Saving…' : 'Save changes'}
        </Button>
      </div>
    </form>
  )
}

// ── Section 2: Active courses ─────────────────────────────────────────────────

const STATUS_STYLES: Record<Course['status'], string> = {
  active:    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  completed: 'bg-muted text-muted-foreground',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
}

function ActiveCourses() {
  const [courses,   setCourses]   = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    api.get<ApiPage<ApiMyCourseItem>>('/courses/me/?status=active&page_size=6')
      .then((data) => setCourses(data.results.map(mapMyCourseItem)))
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  if (isLoading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-lg" />
        ))}
      </div>
    )
  }

  if (courses.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No active courses right now.</p>
    )
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {courses.map((course) => (
        <div key={course.id} className="flex gap-3 rounded-lg border p-3">
          <img
            src={course.thumbnail}
            alt=""
            className="size-12 shrink-0 rounded-md object-cover"
            loading="lazy"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium leading-tight">{course.title}</p>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <span className={`rounded-full px-1.5 py-px text-[10px] font-medium capitalize ${STATUS_STYLES[course.status]}`}>
                {course.status}
              </span>
              {course.maxStudents && (
                <span className="flex items-center gap-0.5 text-[11px] text-muted-foreground">
                  <Users className="size-3" />{course.maxStudents} max
                </span>
              )}
              {course.startDate && (
                <span className="flex items-center gap-0.5 text-[11px] text-muted-foreground">
                  <Calendar className="size-3" />
                  {new Date(course.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Section 3: Security ───────────────────────────────────────────────────────

function ChangePasswordForm() {
  const [current,  setCurrent]  = useState('')
  const [next,     setNext]     = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (next !== confirm) {
      setFeedback({ ok: false, msg: 'New passwords do not match.' })
      return
    }
    setFeedback(null)
    setIsSaving(true)
    try {
      await api.post('/accounts/me/password/', {
        current_password: current,
        new_password: next,
        confirm_password: confirm,
      })
      setFeedback({ ok: true, msg: 'Password updated.' })
      setCurrent(''); setNext(''); setConfirm('')
    } catch (err: unknown) {
      const detail = (err as { detail?: Record<string, string[]> })?.detail
      const msg = detail
        ? Object.values(detail).flat().join(' ')
        : 'Failed to update password.'
      setFeedback({ ok: false, msg })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Field label="Current password">
        <Input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} required autoComplete="current-password" />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="New password">
          <Input type="password" value={next} onChange={(e) => setNext(e.target.value)} required autoComplete="new-password" minLength={8} />
        </Field>
        <Field label="Confirm new password">
          <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required autoComplete="new-password" />
        </Field>
      </div>
      {feedback && <Feedback {...feedback} />}
      <div>
        <Button type="submit" variant="outline" disabled={isSaving}>
          {isSaving ? 'Updating…' : 'Update password'}
        </Button>
      </div>
    </form>
  )
}

function ChangeEmailForm({ currentEmail }: { currentEmail: string }) {
  const [newEmail,  setNewEmail]  = useState('')
  const [password,  setPassword]  = useState('')
  const [isSaving,  setIsSaving]  = useState(false)
  const [feedback,  setFeedback]  = useState<{ ok: boolean; msg: string } | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFeedback(null)
    setIsSaving(true)
    try {
      const updated = await api.post<UserProfile>('/accounts/me/email/', {
        new_email: newEmail,
        current_password: password,
      })
      saveProfile(updated)
      setFeedback({ ok: true, msg: `Email updated to ${updated.email}.` })
      setNewEmail(''); setPassword('')
    } catch (err: unknown) {
      const detail = (err as { detail?: Record<string, string[]> })?.detail
      const msg = detail
        ? Object.values(detail).flat().join(' ')
        : 'Failed to update email.'
      setFeedback({ ok: false, msg })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Field label="Current email">
        <Input value={currentEmail} disabled className="text-muted-foreground" />
      </Field>
      <Field label="New email">
        <Input
          type="email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          placeholder="new@example.com"
          required
          autoComplete="email"
        />
      </Field>
      <Field label="Confirm with your password">
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
      </Field>
      {feedback && <Feedback {...feedback} />}
      <div>
        <Button type="submit" variant="outline" disabled={isSaving}>
          {isSaving ? 'Updating…' : 'Update email'}
        </Button>
      </div>
    </form>
  )
}

// ── Page root ─────────────────────────────────────────────────────────────────

export function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(getProfile)

  useEffect(() => {
    if (profile) return
    fetchAndSaveProfile().then((p) => { if (p) setProfile(p) })
  }, [profile])

  if (!profile) {
    return (
      <div className="flex flex-col gap-6">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ── Basic info ── */}
      <SectionCard title="Profile">
        <ProfileForm profile={profile} onSaved={setProfile} />
      </SectionCard>

      {/* ── Active courses ── */}
      <SectionCard title="Active Courses">
        <ActiveCourses />
      </SectionCard>

      {/* ── Security ── */}
      <SectionCard title="Security">
        <div className="flex flex-col gap-8">
          <div>
            <h3 className="mb-4 text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Change Password
            </h3>
            <ChangePasswordForm />
          </div>
          <div className="border-t pt-6">
            <h3 className="mb-4 text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Change Email
            </h3>
            <ChangeEmailForm currentEmail={profile.email} />
          </div>
        </div>
      </SectionCard>
    </div>
  )
}