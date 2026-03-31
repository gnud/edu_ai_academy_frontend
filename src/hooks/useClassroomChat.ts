import { useState, useCallback } from 'react'
import { api } from '@/lib/api'

export interface ChatMember {
  id?: number        // user id
  memberId?: number  // ClassroomGroupMember pk (for kick)
  name: string
  color: string
  role?: string | null
}

export interface ChatTarget {
  userId: number
  name: string
  avatarColor: string
  threadId: string | null
  isGroup?: boolean
  members?: ChatMember[]
}

export interface ChatWindowState extends ChatTarget {
  minimized: boolean
  deleted?: boolean
  pendingMention?: string
}

export function useClassroomChat() {
  const [windows, setWindows] = useState<ChatWindowState[]>([])

  const openChat = useCallback(async (
    target: Omit<ChatTarget, 'threadId'> & { threadId?: string | null },
  ) => {
    // Already open — just restore if minimized.
    setWindows((prev) => {
      const existing = prev.find((w) => w.userId === target.userId)
      if (existing) {
        return prev.map((w) =>
          w.userId === target.userId ? { ...w, minimized: false } : w,
        )
      }
      return [...prev, { ...target, threadId: target.threadId ?? null, minimized: false }]
    })

    // If threadId already provided (group chat), nothing more to do.
    if (target.threadId) return

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

  const markChatDeleted = useCallback((userId: number) => {
    setWindows((prev) =>
      prev.map((w) => (w.userId === userId ? { ...w, deleted: true, minimized: false } : w)),
    )
  }, [])

  const mentionInChat = useCallback((userId: number, text: string) => {
    setWindows((prev) =>
      prev.map((w) => (w.userId === userId ? { ...w, pendingMention: text, minimized: false } : w)),
    )
  }, [])

  const openWindows     = windows.filter((w) => !w.minimized)
  const minimizedWindows = windows.filter((w) => w.minimized)

  return { openWindows, minimizedWindows, openChat, minimizeChat, closeChat, restoreChat, markChatDeleted, mentionInChat }
}
