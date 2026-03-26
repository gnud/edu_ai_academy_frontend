import { Archive, CheckCircle2, XCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { HubEnrollment } from '@/lib/hubApi'

// import { fakeCourses } from '@/data/courses'

interface ArchiveSectionProps {
  items: HubEnrollment[]
  isLoading?: boolean
}

export function ArchiveSection({ items, isLoading = false }: ArchiveSectionProps) {
  const completed = items.filter((e) => e.semester.status === 'completed')
  const cancelled = items.filter((e) => e.semester.status === 'cancelled')

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
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-6 py-3">
              <div className="bg-muted size-4 shrink-0 animate-pulse rounded-full" />
              <div className="flex flex-1 flex-col gap-1.5">
                <div className="bg-muted h-3 w-2/3 animate-pulse rounded" />
                <div className="bg-muted h-2.5 w-1/3 animate-pulse rounded" />
              </div>
            </div>
          ))
        ) : items.length === 0 ? (
          <p className="text-muted-foreground px-6 py-4 text-center text-sm">Nothing archived yet.</p>
        ) : (
          items.map((enrollment) => {
            const { course, semester } = enrollment
            const isCompleted = semester.status === 'completed'
            const endLabel = semester.ends_on
              ? new Date(semester.ends_on).toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric', year: 'numeric',
                })
              : '—'

            return (
              <div key={enrollment.id} className="flex items-center gap-3 px-6 py-3">
                {isCompleted
                  ? <CheckCircle2 className="size-4 shrink-0 text-green-600" />
                  : <XCircle className="size-4 shrink-0 text-red-400" />
                }
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{course.title}</p>
                  <p className="text-muted-foreground text-xs">{semester.name}</p>
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