import { useState } from 'react'
import { InboxFolderNav } from '@/components/inbox/InboxFolderNav'
import { ThreadList } from '@/components/inbox/ThreadList'
import { ThreadDetail, NoThreadSelected } from '@/components/inbox/ThreadDetail'
import type { Folder, Thread } from '@/data/inbox'
import { fakeThreads } from '@/data/inbox'

export function InboxPage() {
  const [threads, setThreads] = useState<Thread[]>(fakeThreads)
  const [folder, setFolder]   = useState<Folder>('inbox')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const displayed = threads.filter((t) => {
    if (folder === 'starred') return t.isStarred
    return t.folder === folder
  })
  const selected = selectedId ? threads.find((t) => t.id === selectedId) ?? null : null

  function handleSelect(thread: Thread) {
    setSelectedId(thread.id)
    // Mark as read
    setThreads((prev) =>
      prev.map((t) => (t.id === thread.id ? { ...t, isRead: true } : t)),
    )
  }

  function handleToggleStar(id: string) {
    setThreads((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isStarred: !t.isStarred } : t)),
    )
  }

  function handleDelete(id: string) {
    setThreads((prev) => prev.filter((t) => t.id !== id))
    setSelectedId(null)
  }

  function handleFolderChange(next: Folder) {
    setFolder(next)
    setSelectedId(null)
  }

  return (
    // Negative margins cancel the parent's p-4 md:p-6 so inbox fills edge-to-edge.
    // flex-1 + min-h-0 lets the panel grow to fill remaining viewport height.
    <div className="-m-4 md:-m-6 flex flex-1 min-h-0 overflow-hidden rounded-xl border bg-background shadow-sm">
      {/* Left: folder nav */}
      <InboxFolderNav
        active={folder}
        onSelect={handleFolderChange}
        onCompose={() => {}}
      />

      {/* Middle: thread list */}
      <div className="flex w-80 shrink-0 flex-col border-r">
        {/* Folder title + count */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-sm font-semibold capitalize">{folder}</h2>
          <span className="text-xs text-muted-foreground">{displayed.length} conversations</span>
        </div>
        <ThreadList
          threads={displayed}
          selectedId={selectedId}
          onSelect={handleSelect}
          onToggleStar={handleToggleStar}
        />
      </div>

      {/* Right: conversation detail */}
      {selected
        ? <ThreadDetail thread={selected} onDelete={handleDelete} />
        : <NoThreadSelected />
      }
    </div>
  )
}