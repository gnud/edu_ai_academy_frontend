import { useState, useEffect, useRef, useCallback } from 'react'
import { api } from '@/lib/api'
import { getProfile } from '@/lib/auth'
import type { Folder, Thread } from '@/data/inbox'
import type { ApiThreadListItem, ApiThreadDetailItem, ApiPage } from '@/lib/inboxApi'
import { mapApiThread, mapApiThreadDetail } from '@/lib/inboxApi'

interface ApiReplyMessage {
  id: number
  body: string
  sent_at: string
  sender: { id: number; username: string; full_name: string } | null
}

export function useInbox() {
  const myUserId = getProfile()?.id ?? 0

  const [folder, setFolder]       = useState<Folder>('inbox')
  const [threads, setThreads]     = useState<Thread[]>([])
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const abortRef = useRef<AbortController | null>(null)

  // ── Fetch thread list whenever folder changes ──────────────────────────────
  useEffect(() => {
    abortRef.current?.abort()
    const ctrl = new AbortController()
    abortRef.current = ctrl

    setLoading(true)
    setError(null)

    const params =
      folder === 'starred'
        ? 'is_starred=true&page_size=50'
        : `folder=${folder}&page_size=50`

    api
      .get<ApiPage<ApiThreadListItem>>(`/messages/threads/?${params}`, { signal: ctrl.signal })
      .then((page) => {
        if (ctrl.signal.aborted) return
        setThreads(page.results.map((t) => mapApiThread(t, myUserId)))
        setLoading(false)
      })
      .catch(() => {
        if (ctrl.signal.aborted) return
        setError('Failed to load messages.')
        setLoading(false)
      })

    return () => ctrl.abort()
  }, [folder, myUserId])

  // ── Open a thread (load full messages) ─────────────────────────────────────
  const selectThread = useCallback(
    async (id: string) => {
      setSelectedId(id)
      // Optimistically mark as read in the list
      setThreads((prev) => prev.map((t) => (t.id === id ? { ...t, isRead: true } : t)))

      try {
        const detail = await api.get<ApiThreadDetailItem>(`/messages/threads/${id}/`)
        setThreads((prev) =>
          prev.map((t) => {
            if (t.id !== id) return t
            // Merge detail messages; preserve local folder/star from list state
            const full = mapApiThreadDetail(detail, myUserId)
            return { ...full, folder: t.folder, isStarred: t.isStarred }
          }),
        )
      } catch {
        // Keep the preview — detail fetch failure is non-fatal
      }
    },
    [myUserId],
  )

  // ── Star / unstar ──────────────────────────────────────────────────────────
  const toggleStar = useCallback(
    async (id: string) => {
      const thread = threads.find((t) => t.id === id)
      if (!thread) return
      const next = !thread.isStarred
      // Optimistic
      setThreads((prev) => prev.map((t) => (t.id === id ? { ...t, isStarred: next } : t)))
      try {
        await api.patch(`/messages/threads/${id}/me/`, { is_starred: next })
      } catch {
        // Rollback
        setThreads((prev) => prev.map((t) => (t.id === id ? { ...t, isStarred: !next } : t)))
      }
    },
    [threads],
  )

  // ── Archive (DELETE = archive for caller) ──────────────────────────────────
  const archiveThread = useCallback(
    async (id: string) => {
      setThreads((prev) => prev.filter((t) => t.id !== id))
      if (selectedId === id) setSelectedId(null)
      try {
        await api.delete(`/messages/threads/${id}/`)
      } catch {
        // Silently ignore — thread is already removed from the list
      }
    },
    [selectedId],
  )

  // ── Reply ──────────────────────────────────────────────────────────────────
  const sendReply = useCallback(async (threadId: string, body: string) => {
    const msg = await api.post<ApiReplyMessage>(
      `/messages/threads/${threadId}/messages/`,
      { body },
    )
    setThreads((prev) =>
      prev.map((t) => {
        if (t.id !== threadId) return t
        const newMsg = {
          id:     String(msg.id),
          from:   { id: 'me', name: 'You', email: '' },
          to:     [],
          body:   msg.body,
          sentAt: new Date(msg.sent_at),
        }
        return { ...t, messages: [...t.messages, newMsg] }
      }),
    )
  }, [])

  // ── Folder navigation ─────────────────────────────────────────────────────
  const changeFolder = useCallback((next: Folder) => {
    setFolder(next)
    setSelectedId(null)
  }, [])

  const selected = selectedId
    ? (threads.find((t) => t.id === selectedId) ?? null)
    : null

  return {
    folder, threads, loading, error,
    selectedId, selected,
    changeFolder, selectThread, toggleStar, archiveThread, sendReply,
  }
}