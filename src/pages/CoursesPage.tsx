import { fakeCourses } from '@/data/courses'
import { CourseGridView } from '@/components/courses/CourseGridView'
import { useCourseGrid } from '@/hooks/useCourseGrid'

// Simulates page_size coming from the server.
const PAGE_SIZE = 10

export function CoursesPage() {
  const grid = useCourseGrid(fakeCourses, PAGE_SIZE)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Courses</h1>
        <p className="text-muted-foreground text-sm">Browse and track your enrolled courses.</p>
      </div>

      <CourseGridView {...grid} allItemsCount={fakeCourses.length} pageSize={PAGE_SIZE} />
    </div>
  )
}