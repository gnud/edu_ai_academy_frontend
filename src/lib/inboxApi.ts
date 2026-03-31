/**
 * Django messaging API — response types and mapping utilities.
 *
 * GET  /api/messages/threads/              → ApiThreadListItem[]  (paginated)
 * GET  /api/messages/threads/<id>/         → ApiThreadDetailItem
 * POST /api/messages/threads/<id>/messages/ → ApiMessage
 * PATCH /api/messages/threads/<id>/me/     → ApiParticipant
 * DELETE /api/messages/threads/<id>/       → 204 (archives for caller)
 */

import type { Folder, Message, Thread } from '@/data/inbox'
import type { ApiPage } from '@/lib/courseApi'

export type { ApiPage }

// ── Raw API shapes ─────────────────────────────────────────────────────────

export interface ApiSender {
  id: number
  username: string
  full_name: string
  role: 'professor' | 'admin' | 'support' | 'ai_bot' | null
}

export interface ApiMessage {
  id: number
  sender: ApiSender | null
  body: string
  message_type: string
  metadata: Record<string, unknown>
  sent_at: string
}

export interface ApiParticipant {
  user_id: number
  username: string
  full_name: string
  folder: string          // inbox | archived | spam | drafts
  is_starred: boolean
  last_read_at: string | null
}

export interface ApiLastMessage {
  body_preview: string
  sent_at: string
  sender: string | null   // username only
}

export interface ApiThreadListItem {
  id: number
  thread_type: string
  subject: string
  course: number | null
  last_message_at: string | null
  created_at: string
  participants: ApiParticipant[]
  message_count: number
  unread_count: number
  last_message: ApiLastMessage | null
  my_state: ApiParticipant | null
}

export interface ApiThreadDetailItem extends ApiThreadListItem {
  messages: ApiMessage[]
}

// ── Mappers ────────────────────────────────────────────────────────────────

function apiFolder(f: string | null | undefined): Exclude<Folder, 'starred'> {
  switch (f) {
    case 'archived': return 'archived'
    case 'spam':     return 'spam'
    case 'drafts':   return 'drafts'
    default:         return 'inbox'
  }
}

/**
 * Map a list-level thread (preview only — last message body_preview).
 * Used to populate the ThreadList before detail is loaded.
 */
export function mapApiThread(item: ApiThreadListItem, myUserId: number): Thread {
  const state = item.my_state
  const last  = item.last_message

  const messages: Message[] = last
    ? [{
        id:     `${item.id}-preview`,
        from:   {
          id:    last.sender ?? 'system',
          name:  last.sender ?? 'System',
          email: '',
        },
        to:     [],
        body:   last.body_preview,
        sentAt: new Date(last.sent_at),
      }]
    : []

  return {
    id:        String(item.id),
    subject:   item.subject || `(${item.thread_type})`,
    messages,
    folder:    apiFolder(state?.folder),
    isRead:    (item.unread_count ?? 0) === 0,
    isStarred: state?.is_starred ?? false,
  }
}

/**
 * Map a detail-level thread (all messages with full bodies).
 * Called after the user opens a thread.
 */
export function mapApiThreadDetail(item: ApiThreadDetailItem, myUserId: number): Thread {
  const state = item.my_state

  const messages: Message[] = item.messages.map((msg) => ({
    id:     String(msg.id),
    from:   msg.sender
      ? {
          id:    msg.sender.id === myUserId ? 'me' : String(msg.sender.id),
          name:  msg.sender.full_name || msg.sender.username,
          email: msg.sender.username,
        }
      : { id: 'system', name: 'System', email: '' },
    to:     [],
    body:   msg.body,
    sentAt: new Date(msg.sent_at),
  }))

  return {
    id:        String(item.id),
    subject:   item.subject || `(${item.thread_type})`,
    messages,
    folder:    apiFolder(state?.folder),
    isRead:    true,   // server marks read on GET detail
    isStarred: state?.is_starred ?? false,
  }
}