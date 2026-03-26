import { CalendarClock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { HubEnrollment } from '@/lib/hubApi'

// import { fakeCourses } from '@/data/courses'

function daysUntil(dateStr: string | null): number {
  if (!dateStr) return 0
  const now = new Date()
  const target = new Date(dateStr)
  return Math.max(0, Math.ceil((target.getTime() - now.getTime()) / 86_400_000))
}

interface ScheduledSectionProps {
  items: HubEnrollment[]
  isLoading?: boolean
}

export function ScheduledSection({ items, isLoading = false }: ScheduledSectionProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarClock className="size-4" />
            Scheduled Courses
          </CardTitle>
          <Badge variant="secondary">{items.length}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 pt-0">
        {isLoading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
              <div className="bg-muted size-12 shrink-0 animate-pulse rounded-md" />
              <div className="flex flex-1 flex-col gap-1.5">
                <div className="bg-muted h-3 w-2/3 animate-pulse rounded" />
                <div className="bg-muted h-2.5 w-1/3 animate-pulse rounded" />
              </div>
            </div>
          ))
        ) : items.length === 0 ? (
          <p className="text-muted-foreground py-4 text-center text-sm">No scheduled courses.</p>
        ) : (
          items.map((enrollment) => {
            const { course, semester } = enrollment
            const days = daysUntil(semester.starts_on)
            const startLabel = semester.starts_on
              ? new Date(semester.starts_on).toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric', year: 'numeric',
                })
              : 'TBA'

            // Picsum placeholder keyed by course id for a stable image
            const thumbnail = `https://picsum.photos/seed/course-${course.id}/96/96`

            return (
              <div
                key={enrollment.id}
                className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
              >
                <img
                  src={thumbnail}
                  alt={course.title}
                  className="size-12 shrink-0 rounded-md object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{course.title}</p>
                  <p className="text-muted-foreground text-xs">{semester.name}</p>
                  <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                    <span>Starts {startLabel}</span>
                    {semester.max_students && (
                      <span>Max {semester.max_students} students</span>
                    )}
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={
                    days <= 7
                      ? 'border-amber-400 text-amber-600 dark:text-amber-400'
                      : 'text-muted-foreground'
                  }
                >
                  {days === 0 ? 'Today' : `${days}d`}
                </Badge>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}