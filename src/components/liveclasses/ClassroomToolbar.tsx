import { Users, UserMinus, LayoutGrid, Plus } from 'lucide-react'

interface ClassroomToolbarProps {
  selectMode: boolean
  selectedCount: number
  groupingActive: boolean
  onToggleSelectMode: () => void
  onCreateGroup: () => void
  onActivateGrouping: () => void
  onDeactivateGrouping: () => void
}

export function ClassroomToolbar({
  selectMode,
  selectedCount,
  groupingActive,
  onToggleSelectMode,
  onCreateGroup,
  onActivateGrouping,
  onDeactivateGrouping,
}: ClassroomToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border bg-background px-3 py-2 shadow-sm">
      <span className="text-xs font-semibold text-muted-foreground shrink-0">Professor</span>

      {/* Select-mode toggle */}
      <button
        onClick={onToggleSelectMode}
        className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition ${
          selectMode
            ? 'bg-primary text-primary-foreground'
            : 'border hover:bg-muted'
        }`}
      >
        <LayoutGrid className="size-3.5" />
        {selectMode ? `Select Students (${selectedCount})` : 'Select Students'}
      </button>

      {/* New Group — appears right after Select Students when ≥1 selected */}
      {selectMode && selectedCount > 0 && (
        <button
          onClick={onCreateGroup}
          className="flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-700"
        >
          <Plus className="size-3.5" />
          New Group
        </button>
      )}

      <div className="ml-auto" />

      {/* Activate / deactivate grouping */}
      {groupingActive ? (
        <button
          onClick={onDeactivateGrouping}
          className="flex shrink-0 items-center gap-1.5 rounded-full border border-red-300 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <UserMinus className="size-3.5" />
          Deactivate Grouping
        </button>
      ) : (
        <button
          onClick={onActivateGrouping}
          className="flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-300 px-3 py-1 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
        >
          <Users className="size-3.5" />
          Activate Grouping
        </button>
      )}
    </div>
  )
}
