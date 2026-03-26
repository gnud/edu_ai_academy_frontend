import { Clock, Radio, Video } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { fakeUpcomingSessions } from '@/data/dashboard'

function formatSessionTime(date: Date): string {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const sessionDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const diffDays = Math.round((sessionDay.getTime() - today.getTime()) / 86_400_000)

  const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

  if (diffDays === 0) return `Today · ${time}`
  if (diffDays === 1) return `Tomorrow · ${time}`
  return `${date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} · ${time}`
}

export function UpcomingClasses() {
  // Show next 5 sessions
  const sessions = fakeUpcomingSessions.slice(0, 5)

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Video className="size-4" />
          Next Up
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col divide-y p-0">
        {sessions.map((session) => (
          <div key={session.id} className="flex items-start gap-3 px-6 py-3">
            <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
              {session.isLive
                ? <Radio className="size-4 text-red-500 animate-pulse" />
                : <Video className="size-4 text-muted-foreground" />
              }
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-sm font-medium">{session.courseTitle}</span>
                {session.isLive && (
                  <Badge variant="destructive" className="shrink-0 text-[10px]">LIVE</Badge>
                )}
              </div>
              <span className="text-muted-foreground truncate text-xs">{session.topic}</span>
              <div className="text-muted-foreground flex items-center gap-3 text-xs">
                <span>{formatSessionTime(session.startsAt)}</span>
                <span className="flex items-center gap-1">
                  <Clock className="size-3" />
                  {session.durationMinutes} min
                </span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}