import { Archive, CheckCircle2, XCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { fakeCourses } from '@/data/courses'

export function ArchiveSection() {
  const archived = fakeCourses.filter(
    (c) => c.status === 'completed' || c.status === 'cancelled',
  )
  const completed = archived.filter((c) => c.status === 'completed')
  const cancelled = archived.filter((c) => c.status === 'cancelled')

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Archive className="size-4" />
            Archive
          </CardTitle>
          <div className="flex items-center gap-1.5">
            <Badge variant="secondary" className="gap-1 text-xs">
              <CheckCircle2 className="size-3 text-green-600" />
              {completed.length}
            </Badge>
            <Badge variant="secondary" className="gap-1 text-xs">
              <XCircle className="size-3 text-red-500" />
              {cancelled.length}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col divide-y p-0">
        {archived.length === 0 ? (
          <p className="text-muted-foreground px-6 py-4 text-center text-sm">Nothing archived yet.</p>
        ) : (
          archived.map((course) => {
            const isCompleted = course.status === 'completed'
            const endLabel = course.endDate
              ? new Date(course.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              : '—'

            return (
              <div key={course.id} className="flex items-center gap-3 px-6 py-3">
                {isCompleted
                  ? <CheckCircle2 className="size-4 shrink-0 text-green-600" />
                  : <XCircle className="size-4 shrink-0 text-red-400" />
                }
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{course.title}</p>
                  <p className="text-muted-foreground text-xs">{course.instructorName}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <Badge
                    variant="outline"
                    className={
                      isCompleted
                        ? 'border-green-300 text-green-700 dark:text-green-400'
                        : 'border-red-300 text-red-600 dark:text-red-400'
                    }
                  >
                    {isCompleted ? 'Graduated' : 'Cancelled'}
                  </Badge>
                  <span className="text-muted-foreground text-[10px]">{endLabel}</span>
                </div>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}