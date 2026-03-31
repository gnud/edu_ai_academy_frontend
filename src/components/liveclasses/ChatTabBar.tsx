import type { ChatWindowState } from '@/hooks/useClassroomChat'

interface ChatTabBarProps {
  minimized: ChatWindowState[]
  onRestore: (userId: number) => void
  onClose: (userId: number) => void
}

export function ChatTabBar({ minimized, onRestore, onClose }: ChatTabBarProps) {
  if (minimized.length === 0) return null

  return (
    <div className="fixed bottom-0 right-4 z-50 flex items-end gap-2">
      {minimized.map((w) => (
        <button
          key={w.userId}
          onClick={() => onRestore(w.userId)}
          className="flex items-center gap-2 rounded-t-xl border border-b-0 bg-background px-3 py-2 text-xs font-medium shadow-lg transition hover:bg-muted"
        >
          <span
            className="flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
            style={{ backgroundColor: w.avatarColor }}
          >
            {w.name[0].toUpperCase()}
          </span>
          <span className="max-w-[80px] truncate">{w.name}</span>
          <span
            onClick={(e) => { e.stopPropagation(); onClose(w.userId) }}
            className="ml-1 text-muted-foreground hover:text-foreground"
          >
            ×
          </span>
        </button>
      ))}
    </div>
  )
}
