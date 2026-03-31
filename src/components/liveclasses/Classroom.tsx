import { ProfessorArea } from './ProfessorArea'
import { StudentSeat } from './StudentSeat'
import type { ApiParticipant, ApiSession } from '@/lib/liveClassApi'

const SEATS_PER_ROW = 5
// Show at least a few empty seats beyond enrolled count.
const MIN_EXTRA_SEATS = 3

interface ClassroomProps {
  session: ApiSession
  students: ApiParticipant[]
  professorParticipant: ApiParticipant | null
  professorPresent: boolean
  onClickStudent: (p: ApiParticipant) => void
  onClickProfessor: () => void
  onClickAI: () => void
}

export function Classroom({
  session,
  students,
  professorParticipant,
  professorPresent,
  onClickStudent,
  onClickProfessor,
  onClickAI,
}: ClassroomProps) {
  // Pad seats to a full row + at least MIN_EXTRA_SEATS empty ones.
  const totalSeats =
    Math.ceil((students.length + MIN_EXTRA_SEATS) / SEATS_PER_ROW) * SEATS_PER_ROW

  const seats: (ApiParticipant | null)[] = [
    ...students,
    ...Array(totalSeats - students.length).fill(null),
  ]

  return (
    <div className="flex flex-col items-center gap-6 rounded-2xl border bg-muted/10 p-6 shadow-inner">
      {/* Professor / blackboard area */}
      <ProfessorArea
        professorParticipant={professorParticipant}
        professorName={session.professor_name}
        aiAgent={session.ai_agent}
        professorPresent={professorPresent}
        onClickProfessor={onClickProfessor}
        onClickAI={onClickAI}
      />

      {/* Divider */}
      <div className="w-full border-t border-dashed border-border/50" />

      {/* Student seats grid */}
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: `repeat(${SEATS_PER_ROW}, minmax(0, 1fr))` }}
      >
        {seats.map((p, i) => (
          <StudentSeat
            key={p ? `p-${p.id}` : `empty-${i}`}
            participant={p}
            seatNumber={i + 1}
            onClick={p ? () => onClickStudent(p) : undefined}
          />
        ))}
      </div>

      {students.length === 0 && (
        <p className="text-sm text-muted-foreground">No students have joined yet.</p>
      )}
    </div>
  )
}
