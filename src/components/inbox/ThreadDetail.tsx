import { useRef, useState } from 'react'
import { Archive, ChevronDown, ChevronUp, CornerUpLeft, CornerUpRight, MailOpen, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Folder, Message, Thread } from '@/data/inbox'

function formatFull(date: Date): string {
  return date.toLocaleString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    year: 'numeric', hour: 'numeric', minute: '2-digit',
  })
}

function MessageBubble({ message, defaultOpen }: { message: Message; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen)

  const fromMe = message.from.id === 'me'
  const initials = message.from.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
  const colors = [
    'bg-blue-500', 'bg-green-500', 'bg-purple-500',
    'bg-amber-500', 'bg-rose-500', 'bg-teal-500',
  ]
  const color = fromMe ? 'bg-gray-400' : colors[message.from.name.charCodeAt(0) % colors.length]

  return (
    <div className="border-b last:border-b-0">
      {/* Header — always visible */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-start gap-3 px-6 py-4 text-left hover:bg-muted/30 transition-colors"
      >
        <div className={cn('flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white', color)}>
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <span className="font-semibold text-sm">{message.from.name}</span>
            <span className="shrink-0 text-xs text-muted-foreground">{formatFull(message.sentAt)}</span>
          </div>
          <p className="text-xs text-muted-foreground truncate">
            {fromMe
              ? `to ${message.to.map((t) => t.name).join(', ')}`
              : `<${message.from.email}>`
            }
          </p>
          {!open && (
            <p className="mt-1 truncate text-xs text-muted-foreground">
              {message.body.replace(/\n+/g, ' ').slice(0, 80)}…
            </p>
          )}
        </div>
        <div className="mt-1 shrink-0 text-muted-foreground">
          {open ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        </div>
      </button>

      {/* Body */}
      {open && (
        <div className="px-6 pb-6 pl-[60px]">
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
            {message.body}
          </div>
        </div>
      )}
    </div>
  )
}

interface ThreadDetailProps {
  thread: Thread
  folder: Folder
  onArchive: (id: string) => void
  onDelete: (id: string) => void
  onMarkUnread: (id: string) => void
  onReply: (threadId: string, body: string) => Promise<void>
}

export function ThreadDetail({ thread, folder, onArchive, onDelete, onMarkUnread, onReply }: ThreadDetailProps) {
  const [replyBody, setReplyBody] = useState('')
  const [sending, setSending]     = useState(false)
  const textareaRef               = useRef<HTMLTextAreaElement>(null)

  async function handleSend() {
    const body = replyBody.trim()
    if (!body || sending) return
    setSending(true)
    try {
      await onReply(thread.id, body)
      setReplyBody('')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Thread header */}
      <div className="flex items-start justify-between gap-4 border-b px-6 py-4">
        <h2 className="text-lg font-semibold leading-snug">{thread.subject}</h2>
        <div className="flex shrink-0 items-center gap-1">
          <button className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground" title="Reply">
            <CornerUpLeft className="size-4" />
          </button>
          <button className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground" title="Forward">
            <CornerUpRight className="size-4" />
          </button>
          <button
            onClick={() => onMarkUnread(thread.id)}
            className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
            title="Mark as unread"
          >
            <MailOpen className="size-4" />
          </button>

          {folder === 'archived' ? (
            <button
              onClick={() => onDelete(thread.id)}
              className="rounded-lg p-2 text-muted-foreground transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
              title="Delete permanently"
            >
              <Trash2 className="size-4" />
            </button>
          ) : (
            <button
              onClick={() => onArchive(thread.id)}
              className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
              title="Archive"
            >
              <Archive className="size-4" />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {thread.messages.map((msg, i) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            defaultOpen={i === thread.messages.length - 1}
          />
        ))}
      </div>

      {/* Reply box */}
      <div className="border-t p-4">
        <div className="rounded-2xl border bg-background shadow-sm">
          <div className="border-b px-4 py-2 text-xs text-muted-foreground">
            Reply to {thread.messages[0].from.name}
          </div>
          <textarea
            ref={textareaRef}
            value={replyBody}
            onChange={(e) => setReplyBody(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSend() }}
            placeholder="Write a reply… (Ctrl+Enter to send)"
            rows={3}
            className="w-full resize-none bg-transparent px-4 py-3 text-sm outline-none placeholder:text-muted-foreground"
          />
          <div className="flex items-center justify-between px-4 pb-3">
            <button
              onClick={handleSend}
              disabled={!replyBody.trim() || sending}
              className="rounded-full bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-40"
            >
              {sending ? 'Sending…' : 'Send'}
            </button>
            <button
              onClick={() => setReplyBody('')}
              className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-red-600"
              title="Discard"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function NoThreadSelected() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 text-muted-foreground">
      <div className="text-5xl">✉️</div>
      <p className="text-sm">Select a conversation to read it</p>
    </div>
  )
}