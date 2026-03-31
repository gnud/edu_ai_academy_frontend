import { useState } from 'react'
import { X } from 'lucide-react'
import type { ApiParticipant } from '@/lib/liveClassApi'

interface GroupManagerProps {
  selectedParticipants: ApiParticipant[]
  allStudents: ApiParticipant[]
  onConfirm: (name: string, participantIds: number[]) => void
  onClose: () => void
}

export function GroupManager({ selectedParticipants, allStudents, onConfirm, onClose }: GroupManagerProps) {
  const [name, setName] = useState('')
  const [selected, setSelected] = useState<Set<number>>(
    new Set(selectedParticipants.map((p) => p.id)),
  )

  function toggle(id: number) {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function handleConfirm() {
    const trimmed = name.trim()
    if (!trimmed || selected.size === 0) return
    onConfirm(trimmed, [...selected])
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border bg-background p-5 shadow-2xl">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold">Create Group</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="size-4" />
          </button>
        </div>

        {/* Group name */}
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Group name…"
          className="mb-4 w-full rounded-lg border bg-muted/30 px-3 py-2 text-sm outline-none focus:border-primary"
        />

        {/* Student list */}
        <p className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Students</p>
        <div className="mb-4 max-h-52 overflow-y-auto rounded-lg border divide-y">
          {allStudents.map((p) => (
            <label key={p.id} className="flex cursor-pointer items-center gap-3 px-3 py-2 hover:bg-muted/30">
              <input
                type="checkbox"
                checked={selected.has(p.id)}
                onChange={() => toggle(p.id)}
                className="accent-primary"
              />
              <div
                className="flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: p.avatar_color }}
              >
                {p.full_name[0]?.toUpperCase()}
              </div>
              <span className="flex-1 text-sm">{p.full_name}</span>
            </label>
          ))}
          {allStudents.length === 0 && (
            <p className="px-3 py-2 text-xs text-muted-foreground">No students available.</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-full px-4 py-1.5 text-sm text-muted-foreground hover:bg-muted"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!name.trim() || selected.size === 0}
            className="rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground disabled:opacity-40"
          >
            Create ({selected.size})
          </button>
        </div>
      </div>
    </div>
  )
}
