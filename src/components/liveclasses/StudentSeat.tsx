import { cn } from '@/lib/utils'
import { StudentCharacter } from './StudentCharacter'
import type { ApiParticipant } from '@/lib/liveClassApi'

interface StudentSeatProps {
  participant: ApiParticipant | null  // null = empty seat
  seatNumber: number
  selectable?: boolean
  selected?: boolean
  onClick?: () => void
}

export function StudentSeat({ participant, seatNumber, selectable, selected, onClick }: StudentSeatProps) {
  const isPresent = participant?.attendance_status === 'joined'

  return (
    <button
      onClick={participant ? onClick : undefined}
      disabled={!participant}
      className={cn(
        'relative flex h-24 w-20 flex-col items-center justify-center rounded-xl border-2 transition-all',
        participant
          ? selectable
            ? selected
              ? 'cursor-pointer border-primary bg-primary/10 shadow-md ring-2 ring-primary'
              : 'cursor-pointer border-border bg-background shadow-sm hover:border-primary hover:shadow-md'
            : 'cursor-pointer border-border bg-background shadow-sm hover:border-primary hover:shadow-md'
          : 'cursor-default border-dashed border-border/40 bg-muted/20',
      )}
      title={participant?.full_name}
    >
      {selected && (
        <span className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
          ✓
        </span>
      )}
      {participant ? (
        <StudentCharacter
          name={participant.full_name}
          color={participant.avatar_color}
          isPresent={isPresent}
        />
      ) : (
        <span className="text-xs text-muted-foreground/40">{seatNumber}</span>
      )}
    </button>
  )
}
