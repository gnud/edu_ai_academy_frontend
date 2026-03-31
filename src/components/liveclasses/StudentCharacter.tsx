import { cn } from '@/lib/utils'

interface StudentCharacterProps {
  name: string
  color: string
  isPresent: boolean
  size?: 'sm' | 'md'
}

export function StudentCharacter({ name, color, isPresent, size = 'md' }: StudentCharacterProps) {
  const initials = name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="flex flex-col items-center gap-1">
      {/* Avatar */}
      <div className="relative">
        <div
          className={cn(
            'flex items-center justify-center rounded-full font-bold text-white shadow-md',
            size === 'md' ? 'size-12 text-sm' : 'size-9 text-xs',
          )}
          style={{ backgroundColor: color }}
        >
          {initials}
        </div>
        {/* Presence dot */}
        <span
          className={cn(
            'absolute bottom-0 right-0 size-3 rounded-full border-2 border-background',
            isPresent ? 'bg-green-500' : 'bg-gray-400',
          )}
        />
      </div>
      {/* Name */}
      <span className="max-w-[72px] truncate text-center text-[10px] text-muted-foreground leading-tight">
        {name.split(' ')[0]}
      </span>
    </div>
  )
}
