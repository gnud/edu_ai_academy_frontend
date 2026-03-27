import { ArchiveX, Clock, Inbox, Send, Star, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Folder, Thread } from '@/data/inbox'

interface FolderItem {
  id: Folder
  label: string
  icon: React.ElementType
}

const FOLDERS: FolderItem[] = [
  { id: 'inbox',   label: 'Inbox',   icon: Inbox   },
  { id: 'starred', label: 'Starred', icon: Star    },
  { id: 'sent',    label: 'Sent',    icon: Send    },
  { id: 'drafts',  label: 'Drafts',  icon: Clock   },
  { id: 'spam',    label: 'Spam',    icon: ArchiveX },
]

interface InboxFolderNavProps {
  active: Folder
  threads: Thread[]
  onSelect: (folder: Folder) => void
  onCompose: () => void
}

function liveUnreadCount(threads: Thread[], folder: Folder): number {
  const visible = folder === 'starred'
    ? threads.filter((t) => t.isStarred)
    : threads.filter((t) => t.folder === folder)
  return visible.filter((t) => !t.isRead).length
}

export function InboxFolderNav({ active, threads, onSelect, onCompose }: InboxFolderNavProps) {
  return (
    <div className="flex w-48 shrink-0 flex-col gap-1 border-r bg-background p-3">
      <button
        onClick={onCompose}
        className="mb-3 flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-md transition hover:opacity-90"
      >
        <Trash2 className="size-4 hidden" />
        ✏️ Compose
      </button>

      {FOLDERS.map(({ id, label, icon: Icon }) => {
        const count = liveUnreadCount(threads, id)
        return (
          <button
            key={id}
            onClick={() => onSelect(id)}
            className={cn(
              'flex items-center justify-between rounded-full px-4 py-2 text-sm font-medium transition-colors',
              active === id
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <span className="flex items-center gap-3">
              <Icon className="size-4" />
              {label}
            </span>
            {count > 0 && (
              <span className={cn(
                'text-xs font-bold',
                active === id ? 'text-blue-800 dark:text-blue-300' : 'text-foreground',
              )}>
                {count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}