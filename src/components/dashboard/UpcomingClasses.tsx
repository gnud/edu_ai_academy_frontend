import { Clock, Radio, Video } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { HubSession } from '@/lib/hubApi'

// import { fakeUpcomingSessions } from '@/data/dashboard'

function formatSessionTime(iso: string): string {
  const date = new Date(iso)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const sessionDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const diffDays = Math.round((sessionDay.getTime() - today.getTime()) / 86_400_000)
  const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

  if (diffDays === 0) return `Today · ${time}`
  if (diffDays === 1) return `Tomorrow · ${time}`
  return `${date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} · ${time}`
}

interface UpcomingClassesProps {
  sessions: HubSession[]
  isLoading?: boolean
}

export function UpcomingClasses({ sessions, isLoading = false }: UpcomingClassesProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Video className="size-4" />
          Next Up
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col divide-y p-0">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3 px-6 py-3">
              <div className="bg-muted mt-0.5 size-8 shrink-0 animate-pulse rounded-lg" />
              <div className="flex flex-1 flex-col gap-1.5">
                <div className="bg-muted h-3 w-3/4 animate-pulse rounded" />
                <div className="bg-muted h-2.5 w-1/2 animate-pulse rounded" />
              </div>
            </div>
          ))
        ) : sessions.length === 0 ? (
          <p className="text-muted-foreground px-6 py-4 text-center text-sm">
            No upcoming classes.
          </p>
        ) : (
          sessions.map((session) => {
            const isLive = session.status === 'live'
            return (
              <div key={session.id} className="flex items-start gap-3 px-6 py-3">
                <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                  {isLive
                    ? <Radio className="size-4 animate-pulse text-red-500" />
                    : <Video className="size-4 text-muted-foreground" />
                  }
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium">{session.course_title}</span>
                    {isLive && (
                      <Badge variant="destructive" className="shrink-0 text-[10px]">LIVE</Badge>
                    )}
                  </div>
                  <span className="text-muted-foreground truncate text-xs">{session.title}</span>
                  <div className="text-muted-foreground flex items-center gap-3 text-xs">
                    <span>{formatSessionTime(session.starts_at)}</span>
                    {session.duration_minutes && (
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" />
                        {session.duration_minutes} min
                      </span>
                    )}
                    {session.professor_name && (
                      <span className="truncate">{session.professor_name}</span>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}