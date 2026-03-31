import { useState } from 'react'
import { ChevronDown, ChevronRight, ChevronLeft, MessageSquare, Users } from 'lucide-react'
import { MemberContextMenu } from './MemberContextMenu'
import type { ApiGroup, ApiGroupMember } from '@/lib/liveClassApi'

interface GroupsTabProps {
  groups: ApiGroup[]
  isProfessor: boolean
  onOpenGroupChat: (group: ApiGroup) => void
  onDeleteGroup: (groupId: number) => void
  onPMMember: (member: ApiGroupMember) => void
  onMentionMember: (member: ApiGroupMember, groupId: number) => void
  onKickMember: (member: ApiGroupMember, groupId: number) => void
  onTransferMember: (member: ApiGroupMember, fromGroupId: number) => void
}

interface ContextMenuState {
  member: ApiGroupMember
  groupId: number
  rect: DOMRect
}

export function GroupsTab({
  groups, isProfessor,
  onOpenGroupChat, onDeleteGroup,
  onPMMember, onMentionMember, onKickMember, onTransferMember,
}: GroupsTabProps) {
  const [panelOpen, setPanelOpen]         = useState(false)
  const [expandedIds, setExpandedIds]     = useState<Set<number>>(new Set(groups.map((g) => g.id)))
  const [confirmingId, setConfirmingId]   = useState<number | null>(null)
  const [contextMenu, setContextMenu]     = useState<ContextMenuState | null>(null)

  if (groups.length === 0) return null

  const totalMembers = groups.reduce((sum, g) => sum + g.member_count, 0)

  function toggleExpand(id: number) {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function handleDeleteClick(groupId: number) {
    if (confirmingId === groupId) {
      onDeleteGroup(groupId)
      setConfirmingId(null)
    } else {
      setConfirmingId(groupId)
    }
  }

  function handleMemberClick(e: React.MouseEvent, member: ApiGroupMember, groupId: number) {
    e.stopPropagation()
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    setContextMenu({ member, groupId, rect })
  }

  return (
    <>
      {/* Fixed right-side sticky drawer */}
      <div className="fixed right-0 top-1/2 z-40 -translate-y-1/2 flex items-stretch">

        {/* Slide-out panel */}
        {panelOpen && (
          <div className="flex max-h-[70vh] w-56 flex-col gap-1 overflow-y-auto rounded-l-2xl border border-r-0 bg-background p-2 shadow-xl">
            <p className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Groups · {groups.length}
            </p>

            {groups.map((group) => {
              const expanded = expandedIds.has(group.id)
              return (
                <div key={group.id} className="rounded-xl overflow-hidden">
                  {/* Group header row */}
                  <button
                    onClick={() => toggleExpand(group.id)}
                    className="flex w-full items-center gap-2 rounded-xl px-2 py-2 text-left hover:bg-muted transition-colors"
                  >
                    {expanded
                      ? <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
                      : <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />
                    }
                    <span className="flex-1 truncate text-sm font-medium">{group.name}</span>
                    <span className="text-[10px] text-muted-foreground shrink-0">{group.member_count}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); onOpenGroupChat(group) }}
                      className="rounded-full p-1 text-muted-foreground hover:bg-background hover:text-foreground"
                      title="Open group chat"
                    >
                      <MessageSquare className="size-3" />
                    </button>
                  </button>

                  {/* Expanded member list */}
                  {expanded && (
                    <div className="ml-5 flex flex-col border-l border-border/40 pl-2 pb-1">
                      {group.members.length === 0 ? (
                        <p className="py-1 text-xs text-muted-foreground">No members</p>
                      ) : group.members.map((m) => (
                        <button
                          key={m.id}
                          onClick={(e) => handleMemberClick(e, m, group.id)}
                          className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-muted transition-colors"
                        >
                          <div
                            className="flex size-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white"
                            style={{ backgroundColor: m.avatar_color }}
                          >
                            {m.full_name[0]?.toUpperCase()}
                          </div>
                          <span className="flex-1 truncate text-xs">{m.full_name}</span>
                        </button>
                      ))}

                      {isProfessor && (
                        <button
                          onClick={() => handleDeleteClick(group.id)}
                          className={`mt-1 rounded-lg px-2 py-1 text-left text-xs transition-colors ${
                            confirmingId === group.id
                              ? 'bg-red-500 font-semibold text-white'
                              : 'text-muted-foreground hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20'
                          }`}
                        >
                          {confirmingId === group.id ? 'Yes, delete?' : 'Delete group'}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Tab handle — always visible on right edge */}
        <button
          onClick={() => setPanelOpen((v) => !v)}
          className="flex flex-col items-center gap-1 rounded-l-xl border border-r-0 bg-background px-1.5 py-3 shadow-md hover:bg-muted transition-colors"
          title={panelOpen ? 'Close groups' : 'Open groups'}
        >
          {panelOpen
            ? <ChevronRight className="size-3.5 text-muted-foreground" />
            : <ChevronLeft  className="size-3.5 text-muted-foreground" />
          }
          <Users className="size-4 text-primary" />
          <span className="flex size-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
            {groups.length}
          </span>
          <span
            className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground"
            style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
          >
            Groups · {totalMembers}
          </span>
        </button>
      </div>

      {/* Context menu */}
      {contextMenu && (
        <MemberContextMenu
          member={contextMenu.member}
          anchorRect={contextMenu.rect}
          isProfessor={isProfessor}
          onMention={() => onMentionMember(contextMenu.member, contextMenu.groupId)}
          onPM={() => onPMMember(contextMenu.member)}
          onKick={() => onKickMember(contextMenu.member, contextMenu.groupId)}
          onTransfer={() => onTransferMember(contextMenu.member, contextMenu.groupId)}
          onClose={() => setContextMenu(null)}
        />
      )}
    </>
  )
}
