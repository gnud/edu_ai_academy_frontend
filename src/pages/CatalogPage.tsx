// import { fakeCatalogCourses } from '@/data/courses'
// import { useCourseGrid } from '@/hooks/useCourseGrid'
import { useApiCourseGrid } from '@/hooks/useApiCourseGrid'
import { CourseGridView } from '@/components/courses/CourseGridView'

export function CatalogPage() {
  const grid = useApiCourseGrid('catalog')

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Course Catalog</h1>
        <p className="text-muted-foreground text-sm">Discover all available courses and enroll.</p>
      </div>

      {grid.error && (
        <p className="text-sm text-red-600">{grid.error}</p>
      )}

      <CourseGridView {...grid} />
    </div>
  )
}