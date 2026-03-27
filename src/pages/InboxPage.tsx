import { useInbox } from '@/hooks/useInbox'
import { InboxFolderNav } from '@/components/inbox/InboxFolderNav'
import { ThreadList } from '@/components/inbox/ThreadList'
import { ThreadDetail, NoThreadSelected } from '@/components/inbox/ThreadDetail'

export function InboxPage() {
  const {
    folder, threads, loading, error,
    selectedId, selected,
    changeFolder, selectThread, toggleStar, archiveThread, deleteThread, sendReply,
  } = useInbox()

  const displayed = threads.filter((t) => {
    if (folder === 'starred') return t.isStarred
    return t.folder === folder
  })

  return (
    // Negative margins cancel the parent's p-4 md:p-6 so inbox fills edge-to-edge.
    // flex-1 + min-h-0 lets the panel grow to fill remaining viewport height.
    <div className="-m-4 md:-m-6 flex flex-1 min-h-0 overflow-hidden rounded-xl border bg-background shadow-sm">
      {/* Left: folder nav */}
      <InboxFolderNav
        active={folder}
        threads={threads}
        onSelect={changeFolder}
      />

      {/* Middle: thread list */}
      <div className="flex w-80 shrink-0 flex-col border-r">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-sm font-semibold capitalize">{folder}</h2>
          <span className="text-xs text-muted-foreground">
            {loading ? 'Loading…' : `${displayed.length} conversations`}
          </span>
        </div>

        {error && (
          <p className="px-4 py-3 text-xs text-red-500">{error}</p>
        )}

        <ThreadList
          threads={displayed}
          selectedId={selectedId}
          onSelect={(t) => void selectThread(t.id)}
          onToggleStar={toggleStar}
        />
      </div>

      {/* Right: conversation detail */}
      {selected
        ? <ThreadDetail
            thread={selected}
            folder={folder}
            onArchive={archiveThread}
            onDelete={deleteThread}
            onReply={sendReply}
          />
        : <NoThreadSelected />
      }
    </div>
  )
}