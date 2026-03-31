import { useEffect, useRef } from 'react'
import { AtSign, MessageSquare, LogOut, ArrowRightLeft } from 'lucide-react'
import type { ApiGroupMember } from '@/lib/liveClassApi'

interface MemberContextMenuProps {
  member: ApiGroupMember
  anchorRect: DOMRect
  isProfessor: boolean
  onMention: () => void
  onPM: () => void
  onKick: () => void
  onTransfer: () => void
  onClose: () => void
}

export function MemberContextMenu({
  member, anchorRect, isProfessor,
  onMention, onPM, onKick, onTransfer, onClose,
}: MemberContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onClose])

  // Position below the anchor row, clamped to viewport.
  const top  = anchorRect.bottom + 4
  const left = anchorRect.left

  const items = [
    { icon: <AtSign className="size-3.5" />,          label: 'Mention',  action: onMention },
    { icon: <MessageSquare className="size-3.5" />,   label: 'PM',       action: onPM },
    ...(isProfessor ? [
      { icon: <LogOut className="size-3.5" />,         label: 'Kick',     action: onKick,     danger: true },
      { icon: <ArrowRightLeft className="size-3.5" />, label: 'Transfer', action: onTransfer },
    ] : []),
  ]

  return (
    <div
      ref={ref}
      className="fixed z-[60] min-w-[140px] rounded-xl border bg-background shadow-xl py-1"
      style={{ top, left }}
    >
      <p className="px-3 pt-1 pb-2 text-xs font-semibold text-muted-foreground border-b mb-1 truncate">
        {member.full_name}
      </p>
      {items.map((item) => (
        <button
          key={item.label}
          onClick={() => { item.action(); onClose() }}
          className={`flex w-full items-center gap-2 px-3 py-1.5 text-xs hover:bg-muted ${
            item.danger ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20' : ''
          }`}
        >
          {item.icon}
          {item.label}
        </button>
      ))}
    </div>
  )
}
