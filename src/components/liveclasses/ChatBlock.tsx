// Deterministic avatar color — same palette as the backend.
const AVATAR_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
  '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#3b82f6', '#06b6d4',
]

export function avatarColorForId(id: number): string {
  return AVATAR_COLORS[Math.abs(id) % AVATAR_COLORS.length]
}

const ROLE_LABEL: Record<string, string> = {
  professor: 'Professor',
  admin:     'Admin',
  support:   'Support',
  ai_bot:    'AI',
}

const ROLE_STYLE: Record<string, string> = {
  professor: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
  admin:     'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  support:   'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  ai_bot:    'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
}

export interface ChatMessage {
  id: string
  fromMe: boolean
  body: string
  sentAt: Date
  sender: {
    id: number
    name: string
    role: string | null
  } | null
}

interface ChatBlockProps {
  message: ChatMessage
  /** Show sender name + avatar (always true for received; optional for sent) */
  showSenderInfo?: boolean
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function ChatBlock({ message, showSenderInfo = true }: ChatBlockProps) {
  const { fromMe, body, sentAt, sender } = message

  if (fromMe) {
    return (
      <div className="flex flex-col items-end gap-0.5">
        <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-primary px-3 py-1.5 text-xs text-primary-foreground">
          {body}
        </div>
        <span className="text-[10px] text-muted-foreground">{formatTime(sentAt)}</span>
      </div>
    )
  }

  // Received message — left-aligned with avatar, name, role badge.
  const senderName  = sender?.name ?? 'System'
  const senderId    = sender?.id ?? 0
  const senderColor = avatarColorForId(senderId)
  const role        = sender?.role ?? null

  return (
    <div className="flex items-start gap-2">
      {/* Avatar */}
      <div
        className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
        style={{ backgroundColor: senderColor }}
      >
        {senderName[0]?.toUpperCase() ?? '?'}
      </div>

      <div className="flex flex-col gap-0.5">
        {/* Name + role badge */}
        {showSenderInfo && (
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-semibold text-foreground">{senderName}</span>
            {role && (
              <span className={`rounded-full px-1.5 py-px text-[9px] font-semibold ${ROLE_STYLE[role] ?? ''}`}>
                {ROLE_LABEL[role] ?? role}
              </span>
            )}
          </div>
        )}

        {/* Bubble + timestamp */}
        <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-muted px-3 py-1.5 text-xs text-foreground">
          {body}
        </div>
        <span className="text-[10px] text-muted-foreground">{formatTime(sentAt)}</span>
      </div>
    </div>
  )
}
