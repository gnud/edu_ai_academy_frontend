import { useMemo, useState } from 'react'
import { fakeCourses } from '@/data/courses'
import { CourseCard } from '@/components/courses/CourseCard'
import { CourseFilters, DEFAULT_FILTERS, type CourseFilterState } from '@/components/courses/CourseFilters'
import { CoursePagination } from '@/components/courses/CoursePagination'

// Simulates the page_size coming from the server.
const PAGE_SIZE = 10

function applyFilters(courses: typeof fakeCourses, filters: CourseFilterState) {
  let result = [...courses]

  if (filters.search.trim()) {
    const q = filters.search.toLowerCase()
    result = result.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.instructorName.toLowerCase().includes(q) ||
        c.tags.some((t) => t.includes(q)),
    )
  }

  if (filters.status !== 'all') {
    result = result.filter((c) => c.status === filters.status)
  }

  if (filters.audienceType !== 'all') {
    result = result.filter((c) => c.audienceType === filters.audienceType)
  }

  result.sort((a, b) => {
    switch (filters.sortBy) {
      case 'title':
        return a.title.localeCompare(b.title)
      case 'progress':
        return b.progress - a.progress
      case 'students':
        return b.enrolledStudents - a.enrolledStudents
      case 'date':
      default:
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    }
  })

  return result
}

export function CoursesPage() {
  const [filters, setFilters] = useState<CourseFilterState>(DEFAULT_FILTERS)
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => applyFilters(fakeCourses, filters), [filters])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  function handleFiltersChange(next: CourseFilterState) {
    setFilters(next)
    setPage(1)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Courses</h1>
        <p className="text-muted-foreground text-sm">Browse and track your enrolled courses.</p>
      </div>

      <CourseFilters
        filters={filters}
        total={fakeCourses.length}
        filtered={filtered.length}
        onChange={handleFiltersChange}
      />

      {filtered.length === 0 ? (
        <div className="flex min-h-64 flex-col items-center justify-center gap-2 rounded-xl border border-dashed">
          <p className="font-medium">No courses found</p>
          <p className="text-muted-foreground text-sm">Try adjusting your filters.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {paginated.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>

          <CoursePagination
            page={safePage}
            totalPages={totalPages}
            pageSize={PAGE_SIZE}
            totalItems={filtered.length}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  )
}