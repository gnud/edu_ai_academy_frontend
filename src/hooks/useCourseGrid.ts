import { useMemo, useState } from 'react'
import type { Course } from '@/data/courses'
import { DEFAULT_FILTERS, type CourseFilterState } from '@/components/courses/CourseFilters'

function applyFilters(courses: Course[], filters: CourseFilterState): Course[] {
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

export function useCourseGrid(allCourses: Course[], pageSize: number) {
  const [filters, setFilters] = useState<CourseFilterState>(DEFAULT_FILTERS)
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => applyFilters(allCourses, filters), [allCourses, filters])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const paginated = filtered.slice((safePage - 1) * pageSize, safePage * pageSize)

  function handleFiltersChange(next: CourseFilterState) {
    setFilters(next)
    setPage(1)
  }

  return {
    filters,
    onFiltersChange: handleFiltersChange,
    page: safePage,
    totalPages,
    onPageChange: setPage,
    courses: paginated,
    totalItems: filtered.length,
  }
}