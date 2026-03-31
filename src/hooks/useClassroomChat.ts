import { useState, useCallback } from 'react'
import { api } from '@/lib/api'

export interface ChatTarget {
  userId: number
  name: string
  avatarColor: string
  threadId: string | null  // null until thread is created/found
}

export interface ChatWindow extends ChatTarget {
  minimized: boolean
}

export function useClassroomChat() {
  const [windows, setWindows] = useState<ChatWindow[]>([])

  const openChat = useCallback(async (target: Omit<ChatTarget, 'threadId'>) => {
    // Already open — just restore if minimized.
    setWindows((prev) => {
      const existing = prev.find((w) => w.userId === target.userId)
      if (existing) {
        return prev.map((w) =>
          w.userId === target.userId ? { ...w, minimized: false } : w,
        )
      }
      // Add new window (threadId resolved below).
      return [...prev, { ...target, threadId: null, minimized: false }]
    })

    // Create or find a PM thread with this user.
    try {
      const thread = await api.post<{ id: number }>('/messages/threads/', {
        thread_type: 'pm',
        subject: '',
        participant_ids: [target.userId],
      })
      setWindows((prev) =>
        prev.map((w) =>
          w.userId === target.userId
            ? { ...w, threadId: String(thread.id) }
            : w,
        ),
      )
    } catch {
      // Leave threadId null — ChatWindow will show an error state.
    }
  }, [])

  const minimizeChat = useCallback((userId: number) => {
    setWindows((prev) =>
      prev.map((w) => (w.userId === userId ? { ...w, minimized: true } : w)),
    )
  }, [])

  const closeChat = useCallback((userId: number) => {
    setWindows((prev) => prev.filter((w) => w.userId !== userId))
  }, [])

  const restoreChat = useCallback((userId: number) => {
    setWindows((prev) =>
      prev.map((w) => (w.userId === userId ? { ...w, minimized: false } : w)),
    )
  }, [])

  const openWindows    = windows.filter((w) => !w.minimized)
  const minimizedWindows = windows.filter((w) => w.minimized)

  return { openWindows, minimizedWindows, openChat, minimizeChat, closeChat, restoreChat }
}
