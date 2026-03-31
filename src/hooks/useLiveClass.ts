import { useState, useEffect, useRef, useCallback } from 'react'
import { api } from '@/lib/api'
import type { ApiSession, ApiParticipant } from '@/lib/liveClassApi'

const POLL_INTERVAL_MS = 10_000

export function useLiveClass(sessionId: number | null) {
  const [session, setSession]         = useState<ApiSession | null>(null)
  const [participants, setParticipants] = useState<ApiParticipant[]>([])
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState<string | null>(null)

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // ── Fetch initial detail ───────────────────────────────────────────────────
  useEffect(() => {
    if (!sessionId) return

    setLoading(true)
    setError(null)

    api.get<ApiSession>(`/classes/${sessionId}/`)
      .then((s) => {
        setSession(s)
        setParticipants(s.participants)
        setLoading(false)
      })
      .catch(() => {
        setError('Failed to load session.')
        setLoading(false)
      })
  }, [sessionId])

  // ── Join on enter, leave on exit ──────────────────────────────────────────
  useEffect(() => {
    if (!sessionId) return

    api.post(`/classes/${sessionId}/join/`, {}).catch(() => {/* non-fatal */})

    return () => {
      api.post(`/classes/${sessionId}/leave/`, {}).catch(() => {/* non-fatal */})
    }
  }, [sessionId])

  // ── Poll participants every 10 s while session is live ────────────────────
  useEffect(() => {
    if (!sessionId || !session) return
    if (session.status !== 'live') return

    pollRef.current = setInterval(() => {
      api.get<ApiParticipant[]>(`/classes/${sessionId}/participants/`)
        .then(setParticipants)
        .catch(() => {/* silently ignore poll errors */})
    }, POLL_INTERVAL_MS)

    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [sessionId, session?.status])

  const professorPresent = participants.some(
    (p) => p.role === 'professor' && p.attendance_status === 'joined' && p.user_id !== null,
  )

  const studentParticipants = participants.filter((p) => p.role === 'student')

  return { session, participants, studentParticipants, professorPresent, loading, error }
}
