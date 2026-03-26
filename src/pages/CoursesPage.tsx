// import { fakeCourses } from '@/data/courses'
// import { useCourseGrid } from '@/hooks/useCourseGrid'
import { useApiCourseGrid } from '@/hooks/useApiCourseGrid'
import { CourseGridView } from '@/components/courses/CourseGridView'

export function CoursesPage() {
  const grid = useApiCourseGrid('my-courses')

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Courses</h1>
        <p className="text-muted-foreground text-sm">Browse and track your enrolled courses.</p>
      </div>

      {grid.error && (
        <p className="text-sm text-red-600">{grid.error}</p>
      )}

      <CourseGridView {...grid} />
    </div>
  )
}