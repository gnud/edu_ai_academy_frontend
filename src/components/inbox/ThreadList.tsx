import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Thread } from '@/data/inbox'

function formatTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / 86_400_000)

  if (diffDays === 0) {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  }
  if (diffDays < 7) {
    return date.toLocaleDateString('en-US', { weekday: 'short' })
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function Avatar({ name }: { name: string }) {
  const initials = name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
  const colors = [
    'bg-blue-500', 'bg-green-500', 'bg-purple-500',
    'bg-amber-500', 'bg-rose-500', 'bg-teal-500',
  ]
  const color = colors[name.charCodeAt(0) % colors.length]
  return (
    <div className={cn('flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white', color)}>
      {initials}
    </div>
  )
}

interface ThreadListProps {
  threads: Thread[]
  selectedId: string | null
  onSelect: (thread: Thread) => void
  onToggleStar: (id: string) => void
}

export function ThreadList({ threads, selectedId, onSelect, onToggleStar }: ThreadListProps) {
  if (threads.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
        No messages here.
      </div>
    )
  }

  return (
    <div className="flex flex-col overflow-y-auto">
      {threads.map((thread) => {
        const lastMsg = thread.messages[thread.messages.length - 1]
        const sender = lastMsg.from.name === 'Alex Student' && thread.messages.length > 1
          ? thread.messages[0].from
          : lastMsg.from
        const preview = lastMsg.body.replace(/\n+/g, ' ').slice(0, 100)
        const isSelected = thread.id === selectedId

        return (
          <button
            key={thread.id}
            onClick={() => onSelect(thread)}
            className={cn(
              'group flex items-start gap-3 border-b px-4 py-3 text-left transition-colors',
              isSelected
                ? 'bg-blue-50 dark:bg-blue-950/30'
                : 'hover:bg-muted/50',
            )}
          >
            {/* Unread dot */}
            <div className="mt-3 size-2 shrink-0">
              {!thread.isRead && (
                <div className="size-2 rounded-full bg-blue-500" />
              )}
            </div>

            <Avatar name={sender.name} />

            <div className="min-w-0 flex-1">
              {/* Row 1: sender + time */}
              <div className="flex items-baseline justify-between gap-2">
                <span className={cn('truncate text-sm', !thread.isRead && 'font-bold')}>
                  {sender.name}
                </span>
                <span className="shrink-0 text-[11px] text-muted-foreground">
                  {formatTime(lastMsg.sentAt)}
                </span>
              </div>
              {/* Row 2: subject */}
              <p className={cn('truncate text-sm', !thread.isRead ? 'font-semibold text-foreground' : 'text-foreground/80')}>
                {thread.subject}
              </p>
              {/* Row 3: preview */}
              <p className="truncate text-xs text-muted-foreground">{preview}</p>
            </div>

            {/* Star */}
            <button
              onClick={(e) => { e.stopPropagation(); onToggleStar(thread.id) }}
              className={cn(
                'mt-1 shrink-0 transition-colors',
                thread.isStarred ? 'text-amber-400' : 'text-transparent group-hover:text-muted-foreground',
              )}
            >
              <Star className={cn('size-4', thread.isStarred && 'fill-amber-400')} />
            </button>
          </button>
        )
      })}
    </div>
  )
}