import { useState, useEffect, useRef } from 'react'
import { Minus, X } from 'lucide-react'
import { api } from '@/lib/api'
import type { ApiThreadDetailItem } from '@/lib/inboxApi'

interface Message {
  id: string
  fromMe: boolean
  body: string
  sentAt: Date
}

interface ChatWindowProps {
  threadId: string | null
  targetName: string
  avatarColor: string
  index: number
  onMinimize: () => void
  onClose: () => void
}

export function ChatWindow({ threadId, targetName, avatarColor, index, onMinimize, onClose }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [body, setBody]         = useState('')
  const [sending, setSending]   = useState(false)
  const bottomRef               = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!threadId) return
    api.get<ApiThreadDetailItem>(`/messages/threads/${threadId}/`)
      .then((detail) => {
        setMessages(detail.messages.map((m) => ({
          id:     String(m.id),
          fromMe: false, // will be refined once we have myUserId context
          body:   m.body,
          sentAt: new Date(m.sent_at),
        })))
      })
      .catch(() => {/* ignore */})
  }, [threadId])

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
      setMessages((prev) => [...prev, {
        id: String(msg.id), fromMe: true, body: msg.body, sentAt: new Date(msg.sent_at),
      }])
      setBody('')
    } finally {
      setSending(false)
    }
  }

  // Stack windows right-to-left: rightmost is index 0.
  const rightOffset = 16 + index * 296

  return (
    <div
      className="fixed bottom-10 z-50 flex w-72 flex-col overflow-hidden rounded-2xl border bg-background shadow-xl"
      style={{ right: rightOffset }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-2"
        style={{ backgroundColor: avatarColor }}
      >
        <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-white/20 text-xs font-bold text-white">
          {targetName[0].toUpperCase()}
        </div>
        <span className="flex-1 truncate text-xs font-semibold text-white">{targetName}</span>
        <button onClick={onMinimize} className="text-white/70 hover:text-white">
          <Minus className="size-3.5" />
        </button>
        <button onClick={onClose} className="text-white/70 hover:text-white">
          <X className="size-3.5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex h-52 flex-col gap-2 overflow-y-auto p-3">
        {!threadId && (
          <p className="text-center text-xs text-muted-foreground">Opening chat…</p>
        )}
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.fromMe ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-3 py-1.5 text-xs ${
              m.fromMe
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-foreground'
            }`}>
              {m.body}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
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
    </div>
  )
}
