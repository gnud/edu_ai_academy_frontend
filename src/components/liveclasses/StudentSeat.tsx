import { cn } from '@/lib/utils'
import { StudentCharacter } from './StudentCharacter'
import type { ApiParticipant } from '@/lib/liveClassApi'

interface StudentSeatProps {
  participant: ApiParticipant | null  // null = empty seat
  seatNumber: number
  onClick?: () => void
}

export function StudentSeat({ participant, seatNumber, onClick }: StudentSeatProps) {
  const isPresent = participant?.attendance_status === 'joined'

  return (
    <button
      onClick={participant ? onClick : undefined}
      disabled={!participant}
      className={cn(
        'flex h-24 w-20 flex-col items-center justify-center rounded-xl border-2 transition-all',
        participant
          ? 'cursor-pointer border-border bg-background shadow-sm hover:border-primary hover:shadow-md'
          : 'cursor-default border-dashed border-border/40 bg-muted/20',
      )}
      title={participant?.full_name}
    >
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
