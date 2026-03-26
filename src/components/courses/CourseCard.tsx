import { Calendar, Users } from 'lucide-react'
import type { Course } from '@/data/courses'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const STATUS_STYLES: Record<Course['status'], string> = {
  active:    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  completed: 'bg-muted text-muted-foreground',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
}

const STATUS_LABELS: Record<Course['status'], string> = {
  active:    'Active',
  scheduled: 'Scheduled',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
      <div
        className="h-full rounded-full bg-primary transition-all"
        style={{ width: `${value}%` }}
      />
    </div>
  )
}

interface CourseCardProps {
  course: Course
}

export function CourseCard({ course }: CourseCardProps) {
  const startDate = new Date(course.startDate).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })

  const showProgress = course.status === 'active' || course.status === 'completed'

  return (
    <div className="bg-card text-card-foreground flex flex-col overflow-hidden rounded-xl border shadow-sm transition-shadow hover:shadow-md">
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-muted">
        <img
          src={course.thumbnail}
          alt={course.title}
          className="h-full w-full object-cover"
          loading="lazy"
        />
        <span className={`absolute right-2 top-2 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[course.status]}`}>
          {STATUS_LABELS[course.status]}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="line-clamp-2 font-semibold leading-snug">{course.title}</h3>
          <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">{course.description}</p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {course.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Progress */}
        {showProgress && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>{course.progress}%</span>
            </div>
            <ProgressBar value={course.progress} />
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <Avatar className="size-6">
              <AvatarImage src={course.instructorAvatar} alt={course.instructorName} />
              <AvatarFallback className="text-[10px]">
                {course.instructorName.split(' ').map((n) => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <span className="max-w-[120px] truncate text-xs text-muted-foreground">
              {course.instructorName}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="size-3" />
              {course.enrolledStudents}
              {course.maxStudents ? `/${course.maxStudents}` : ''}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="size-3" />
              {startDate}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}