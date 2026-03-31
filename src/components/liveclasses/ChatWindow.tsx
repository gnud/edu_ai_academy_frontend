import { useState, useEffect, useRef, useCallback } from 'react'
import { Minus, X, ChevronRight, ChevronLeft } from 'lucide-react'
import { api } from '@/lib/api'
import { getProfile } from '@/lib/auth'
import type { ApiThreadDetailItem } from '@/lib/inboxApi'
import type { ChatMember } from '@/hooks/useClassroomChat'
import { ChatBlock } from './ChatBlock'
import { MemberContextMenu } from './MemberContextMenu'
import type { ChatMessage } from './ChatBlock'
import type { ApiGroupMember } from '@/lib/liveClassApi'

interface ChatWindowProps {
  threadId: string | null
  targetName: string
  avatarColor: string
  isGroup?: boolean
  members?: ChatMember[]
  deleted?: boolean
  pendingMention?: string
  index: number
  onMinimize: () => void
  onClose: () => void
  onMentionConsumed?: () => void
  onPMMember?: (member: ApiGroupMember) => void
  onMentionMember?: (member: ApiGroupMember) => void
  onKickMember?: (member: ApiGroupMember) => void
  onTransferMember?: (member: ApiGroupMember) => void
  isProfessor?: boolean
}

interface ContextState { member: ApiGroupMember; rect: DOMRect }

export function ChatWindow({
  threadId, targetName, avatarColor, isGroup, members, deleted, pendingMention,
  index, onMinimize, onClose, onMentionConsumed,
  onPMMember, onMentionMember, onKickMember, onTransferMember, isProfessor,
}: ChatWindowProps) {
  const [messages, setMessages]     = useState<ChatMessage[]>([])
  const [body, setBody]             = useState('')
  const [sending, setSending]       = useState(false)

  // Inject pending mention into input when set from outside.
  useEffect(() => {
    if (!pendingMention || deleted) return
    setBody((prev) => prev + pendingMention)
    onMentionConsumed?.()
  }, [pendingMention, deleted, onMentionConsumed])
  const [membersExpanded, setMembersExpanded] = useState(false)
  const [contextMenu, setContextMenu]         = useState<ContextState | null>(null)
  const bottomRef                   = useRef<HTMLDivElement>(null)
  const profile                     = getProfile()
  const myUserId                    = profile?.id ?? null

  const showSenderInfo = isGroup && (members?.length ?? 0) > 1

  const fetchMessages = useCallback(() => {
    if (!threadId) return
    api.get<ApiThreadDetailItem>(`/messages/threads/${threadId}/`)
      .then((detail) => {
        setMessages(detail.messages.map((m) => ({
          id:     String(m.id),
          fromMe: m.sender?.id === myUserId,
          body:   m.body,
          sentAt: new Date(m.sent_at),
          sender: m.sender
            ? { id: m.sender.id, name: m.sender.full_name || m.sender.username, role: m.sender.role }
            : null,
        })))
      })
      .catch(() => {})
  }, [threadId, myUserId])

  useEffect(() => {
    fetchMessages()
    const interval = setInterval(fetchMessages, 5000)
    return () => clearInterval(interval)
  }, [fetchMessages])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend() {
    const trimmed = body.trim()
    if (!trimmed || !threadId || sending) return
    setSending(true)
    try {
      const msg = await api.post<{ id: number; body: string; sent_at: string }>(
        `/messages/threads/${threadId}/messages/`,
        { body: trimmed },
      )
      const myName = profile?.full_name || profile?.username || 'Me'
      setMessages((prev) => [...prev, {
        id: String(msg.id), fromMe: true, body: msg.body, sentAt: new Date(msg.sent_at),
        sender: myUserId ? { id: myUserId, name: myName, role: null } : null,
      }])
      setBody('')
    } finally {
      setSending(false)
    }
  }

  function handleMemberClick(e: React.MouseEvent, member: ChatMember) {
    if (!isGroup) return
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    // Cast ChatMember to ApiGroupMember shape for the context menu
    const asMember: ApiGroupMember = {
      id: member.memberId ?? 0,
      user_id: member.id ?? null,
      full_name: member.name,
      avatar_color: member.color,
      role: member.role ?? '',
    }
    setContextMenu({ member: asMember, rect })
  }

  const rightOffset = 16 + index * (isGroup ? 360 : 296)

  return (
    <>
      <div
        className="fixed bottom-10 z-50 flex flex-col overflow-hidden rounded-2xl border bg-background shadow-xl"
        style={{ right: rightOffset, width: isGroup ? 340 : 288 }}
      >
        {/* Header */}
        <div className="flex items-center gap-2 px-3 py-2" style={{ backgroundColor: avatarColor }}>
          <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-white/20 text-xs font-bold text-white">
            {targetName[0].toUpperCase()}
          </div>
          <div className="flex flex-1 flex-col min-w-0">
            {isGroup && (
              <span className="text-[10px] font-semibold text-white/70 uppercase tracking-wide leading-none">
                {deleted ? '[Group Chat — DELETED]' : '[Group Chat]'}
              </span>
            )}
            <span className="truncate text-xs font-semibold text-white leading-tight">
              {targetName}{deleted && !isGroup ? ' — DELETED' : ''}
            </span>
          </div>
          <button onClick={onMinimize} className="text-white/70 hover:text-white"><Minus className="size-3.5" /></button>
          <button onClick={onClose}    className="text-white/70 hover:text-white"><X    className="size-3.5" /></button>
        </div>

        {/* Deleted notice */}
        {deleted && (
          <div className="bg-muted/60 px-3 py-1.5 text-center text-xs text-muted-foreground border-b">
            This group was deleted. Chat history is read-only.
          </div>
        )}

        {/* Body: member sidebar + messages */}
        <div className="flex h-52">
          {/* Left member sidebar — group chats only */}
          {isGroup && members && members.length > 0 && (
            <div className={`flex flex-col border-r bg-muted/20 transition-all ${membersExpanded ? 'w-28' : 'w-9'}`}>
              {/* Expand/collapse toggle */}
              <button
                onClick={() => setMembersExpanded((v) => !v)}
                className="flex items-center justify-center py-1.5 text-muted-foreground hover:text-foreground border-b"
                title={membersExpanded ? 'Collapse' : 'Expand members'}
              >
                {membersExpanded
                  ? <ChevronLeft className="size-3" />
                  : <ChevronRight className="size-3" />
                }
              </button>

              {/* Member rows */}
              <div className="flex flex-col gap-0.5 overflow-y-auto py-1 px-1">
                {members.map((m, i) => (
                  <button
                    key={i}
                    onClick={(e) => handleMemberClick(e, m)}
                    className="flex items-center gap-1.5 rounded-lg px-1 py-1 hover:bg-muted transition-colors text-left"
                    title={m.name}
                  >
                    <div
                      className="flex size-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white"
                      style={{ backgroundColor: m.color }}
                    >
                      {m.name[0]?.toUpperCase()}
                    </div>
                    {membersExpanded && (
                      <span className="truncate text-[10px] text-foreground">{m.name}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-3">
            {!threadId && <p className="text-center text-xs text-muted-foreground">Opening chat…</p>}
            {messages.map((m) => (
              <ChatBlock key={m.id} message={m} showSenderInfo={showSenderInfo} />
            ))}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* Input */}
        {!deleted && (
          <div className="border-t p-2">
            <div className="flex items-center gap-1 rounded-full border bg-muted/30 px-3 py-1">
              <input
                value={body}
                onChange={(e) => setBody(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                placeholder="Message…"
                className="flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground"
              />
              <button
                onClick={handleSend}
                disabled={!body.trim() || !threadId || sending}
                className="text-xs font-semibold text-primary disabled:opacity-40"
              >
                Send
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Context menu for member clicks */}
      {contextMenu && (
        <MemberContextMenu
          member={contextMenu.member}
          anchorRect={contextMenu.rect}
          isProfessor={isProfessor ?? false}
          onMention={() => onMentionMember?.(contextMenu.member)}
          onPM={() => onPMMember?.(contextMenu.member)}
          onKick={() => onKickMember?.(contextMenu.member)}
          onTransfer={() => onTransferMember?.(contextMenu.member)}
          onClose={() => setContextMenu(null)}
        />
      )}
    </>
  )
}
