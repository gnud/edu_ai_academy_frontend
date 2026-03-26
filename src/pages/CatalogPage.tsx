import { fakeCatalogCourses } from '@/data/courses'
import { CourseGridView } from '@/components/courses/CourseGridView'
import { useCourseGrid } from '@/hooks/useCourseGrid'

// Simulates page_size coming from the server.
const PAGE_SIZE = 10

export function CatalogPage() {
  const grid = useCourseGrid(fakeCatalogCourses, PAGE_SIZE)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Course Catalog</h1>
        <p className="text-muted-foreground text-sm">Discover all available courses and enroll.</p>
      </div>

      <CourseGridView {...grid} allItemsCount={fakeCatalogCourses.length} pageSize={PAGE_SIZE} />
    </div>
  )
}