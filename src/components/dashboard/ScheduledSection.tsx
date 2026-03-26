import { CalendarClock, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { fakeCourses } from '@/data/courses'

function daysUntil(dateStr: string): number {
  const now = new Date()
  const target = new Date(dateStr)
  return Math.max(0, Math.ceil((target.getTime() - now.getTime()) / 86_400_000))
}

export function ScheduledSection() {
  const scheduled = fakeCourses.filter((c) => c.status === 'scheduled')

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarClock className="size-4" />
            Scheduled Courses
          </CardTitle>
          <Badge variant="secondary">{scheduled.length}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 pt-0">
        {scheduled.length === 0 ? (
          <p className="text-muted-foreground py-4 text-center text-sm">No scheduled courses.</p>
        ) : (
          scheduled.map((course) => {
            const days = daysUntil(course.startDate)
            const startLabel = new Date(course.startDate).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric',
            })

            return (
              <div
                key={course.id}
                className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
              >
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="size-12 shrink-0 rounded-md object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{course.title}</p>
                  <p className="text-muted-foreground text-xs">{course.instructorName}</p>
                  <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                    <span>Starts {startLabel}</span>
                    <span className="flex items-center gap-1">
                      <Users className="size-3" />
                      {course.enrolledStudents}
                      {course.maxStudents ? `/${course.maxStudents}` : ''}
                    </span>
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