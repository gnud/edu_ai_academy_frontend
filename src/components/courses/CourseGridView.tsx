import type { Course } from '@/data/courses'
import { CourseCard } from '@/components/courses/CourseCard'
import { CourseFilters, type CourseFilterState } from '@/components/courses/CourseFilters'
import { CoursePagination } from '@/components/courses/CoursePagination'
import { Skeleton } from '@/components/ui/skeleton'

interface CourseGridViewProps {
  courses: Course[]
  totalItems: number       // after filtering — for pagination + filter count
  allItemsCount: number    // before filtering — shown as total in filter bar
  filters: CourseFilterState
  onFiltersChange: (filters: CourseFilterState) => void
  page: number
  totalPages: number
  pageSize: number
  onPageChange: (page: number) => void
  isLoading?: boolean
}

function GridSkeleton({ count }: { count: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col gap-3 overflow-hidden rounded-xl border">
          <Skeleton className="aspect-video w-full" />
          <div className="flex flex-col gap-2 p-4">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function CourseGridView({
  courses,
  totalItems,
  allItemsCount,
  filters,
  onFiltersChange,
  page,
  totalPages,
  pageSize,
  onPageChange,
  isLoading = false,
}: CourseGridViewProps) {
  return (
    <div className="flex flex-col gap-6">
      <CourseFilters
        filters={filters}
        total={allItemsCount}
        filtered={totalItems}
        onChange={onFiltersChange}
      />

      {isLoading ? (
        <GridSkeleton count={pageSize} />
      ) : totalItems === 0 ? (
        <div className="flex min-h-64 flex-col items-center justify-center gap-2 rounded-xl border border-dashed">
          <p className="font-medium">No courses found</p>
          <p className="text-muted-foreground text-sm">Try adjusting your filters.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>

          <CoursePagination
            page={page}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={onPageChange}
          />
        </>
      )}
    </div>
  )
}