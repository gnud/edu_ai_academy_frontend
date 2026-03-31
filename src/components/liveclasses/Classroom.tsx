import { useState } from 'react'
import { ProfessorArea } from './ProfessorArea'
import { StudentSeat } from './StudentSeat'
import { ClassroomToolbar } from './ClassroomToolbar'
import { GroupingBanner } from './GroupingBanner'
import { GroupManager } from './GroupManager'
import { GroupsTab } from './GroupsTab'
import type { ApiGroup, ApiGroupMember, ApiParticipant, ApiSession } from '@/lib/liveClassApi'

const SEATS_PER_ROW = 5
const MIN_EXTRA_SEATS = 3

interface ClassroomProps {
  session: ApiSession
  students: ApiParticipant[]
  professorParticipant: ApiParticipant | null
  professorPresent: boolean
  isProfessor: boolean
  groups: ApiGroup[]
  onClickStudent: (p: ApiParticipant) => void
  onClickProfessor: () => void
  onClickAI: () => void
  onCreateGroup: (name: string, participantIds: number[]) => void
  onDeleteGroup: (groupId: number) => void
  onOpenGroupChat: (group: ApiGroup) => void
  onActivateGrouping: () => void
  onDeactivateGrouping: () => void
  onPMMember: (member: ApiGroupMember) => void
  onMentionMember: (member: ApiGroupMember, groupId: number) => void
  onKickMember: (member: ApiGroupMember, groupId: number) => void
  onTransferMember: (member: ApiGroupMember, fromGroupId: number) => void
}

export function Classroom({
  session, students, professorParticipant, professorPresent, isProfessor, groups,
  onClickStudent, onClickProfessor, onClickAI,
  onCreateGroup, onDeleteGroup, onOpenGroupChat,
  onActivateGrouping, onDeactivateGrouping,
  onPMMember, onMentionMember, onKickMember, onTransferMember,
}: ClassroomProps) {
  const [selectMode, setSelectMode]       = useState(false)
  const [selectedIds, setSelectedIds]     = useState<Set<number>>(new Set())
  const [showGroupManager, setShowGroupManager] = useState(false)

  const totalSeats =
    Math.ceil((students.length + MIN_EXTRA_SEATS) / SEATS_PER_ROW) * SEATS_PER_ROW
  const seats: (ApiParticipant | null)[] = [
    ...students,
    ...Array(totalSeats - students.length).fill(null),
  ]

  function handleSeatClick(p: ApiParticipant) {
    if (selectMode) {
      setSelectedIds((prev) => {
        const next = new Set(prev)
        next.has(p.id) ? next.delete(p.id) : next.add(p.id)
        return next
      })
    } else {
      onClickStudent(p)
    }
  }

  function handleToggleSelectMode() {
    setSelectMode((v) => !v)
    setSelectedIds(new Set())
  }

  function handleGroupManagerConfirm(name: string, participantIds: number[]) {
    onCreateGroup(name, participantIds)
    setShowGroupManager(false)
    setSelectedIds(new Set())
    setSelectMode(false)
  }

  const selectedParticipants = students.filter((s) => selectedIds.has(s.id))
  const showGroupsPanel      = session.grouping_active && groups.length > 0

  return (
    <div className="flex flex-col gap-4">
      {/* Professor toolbar */}
      {isProfessor && (
        <ClassroomToolbar
          selectMode={selectMode}
          selectedCount={selectedIds.size}
          groupingActive={session.grouping_active}
          onToggleSelectMode={handleToggleSelectMode}
          onCreateGroup={() => setShowGroupManager(true)}
          onActivateGrouping={onActivateGrouping}
          onDeactivateGrouping={onDeactivateGrouping}
        />
      )}

      {/* Grouping stats banner */}
      {session.grouping_active && (
        <GroupingBanner
          professorName={session.professor_name}
          students={students}
          groupCount={groups.filter((g) => g.is_active).length}
        />
      )}

      <div className="flex flex-col items-center gap-6 rounded-2xl border bg-muted/10 p-6 shadow-inner">
        <ProfessorArea
          professorParticipant={professorParticipant}
          professorName={session.professor_name}
          aiAgent={session.ai_agent}
          professorPresent={professorPresent}
          onClickProfessor={onClickProfessor}
          onClickAI={onClickAI}
        />

        <div className="w-full border-t border-dashed border-border/50" />

        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: `repeat(${SEATS_PER_ROW}, minmax(0, 1fr))` }}
        >
          {seats.map((p, i) => (
            <StudentSeat
              key={p ? `p-${p.id}` : `empty-${i}`}
              participant={p}
              seatNumber={i + 1}
              selectable={selectMode && !!p}
              selected={p ? selectedIds.has(p.id) : false}
              onClick={p ? () => handleSeatClick(p) : undefined}
            />
          ))}
        </div>

        {students.length === 0 && (
          <p className="text-sm text-muted-foreground">No students have joined yet.</p>
        )}
      </div>

      {/* Groups tab (right-side sticky) */}
      {showGroupsPanel && (
        <GroupsTab
          groups={groups}
          isProfessor={isProfessor}
          onOpenGroupChat={onOpenGroupChat}
          onDeleteGroup={onDeleteGroup}
          onPMMember={onPMMember}
          onMentionMember={onMentionMember}
          onKickMember={onKickMember}
          onTransferMember={onTransferMember}
        />
      )}

      {/* Group manager modal */}
      {showGroupManager && (
        <GroupManager
          selectedParticipants={selectedParticipants}
          allStudents={students}
          onConfirm={handleGroupManagerConfirm}
          onClose={() => setShowGroupManager(false)}
        />
      )}
    </div>
  )
}
