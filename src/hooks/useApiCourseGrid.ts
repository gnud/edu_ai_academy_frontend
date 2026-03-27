/**
 * Server-driven version of useCourseGrid.
 *
 * actionType controls which endpoint is called:
 *   'catalog'    → GET /api/courses/     (public catalog, ?q= ?audience=)
 *   'my-courses' → GET /api/courses/me/  (enrolled, ?q= ?status=)
 *
 * Pagination and search/filter are handled server-side.
 * Sorting is applied client-side on the current page's results
 * (the Django API does not yet expose a sort param).
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import { api } from '@/lib/api'
import {
  mapCatalogItem,
  mapMyCourseItem,
  type ApiCourseCatalogItem,
  type ApiMyCourseItem,
  type ApiPage,
} from '@/lib/courseApi'
import { DEFAULT_FILTERS, type CourseFilterState } from '@/components/courses/CourseFilters'
import type { Course } from '@/data/courses'

export type ActionType = 'catalog' | 'my-courses'

function sortCourses(courses: Course[], sortBy: CourseFilterState['sortBy']): Course[] {
  const copy = [...courses]
  copy.sort((a, b) => {
    switch (sortBy) {
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
  return copy
}

export function useApiCourseGrid(actionType: ActionType, initialQuery = '') {
  const [filters, setFilters] = useState<CourseFilterState>({
    ...DEFAULT_FILTERS,
    search: initialQuery,
  })
  const [page, setPage] = useState(1)

  const [rawCourses, setRawCourses] = useState<Course[]>([])
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [pageSize,   setPageSize]   = useState(10)
  const [isLoading,  setIsLoading]  = useState(false)
  const [error,      setError]      = useState<string | null>(null)

  // Abort previous in-flight request when filters/page change.
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    const params = new URLSearchParams()
    if (filters.search.trim()) params.set('q', filters.search.trim())
    if (actionType === 'my-courses' && filters.status !== 'all') params.set('status', filters.status)
    if (actionType === 'catalog'    && filters.audienceType !== 'all') params.set('audience', filters.audienceType)
    params.set('page', String(page))

    const endpoint =
      actionType === 'catalog'
        ? `/courses/?${params}`
        : `/courses/me/?${params}`

    setIsLoading(true)
    setError(null)

    api
      .get<ApiPage<ApiCourseCatalogItem | ApiMyCourseItem>>(endpoint, {
        signal: controller.signal,
      })
      .then((data) => {
        const courses =
          actionType === 'catalog'
            ? (data.results as ApiCourseCatalogItem[]).map(mapCatalogItem)
            : (data.results as ApiMyCourseItem[]).map(mapMyCourseItem)

        setRawCourses(courses)
        setTotalItems(data.pagination.count)
        setTotalPages(data.pagination.pages)
        setPageSize(data.pagination.page_size)
      })
      .catch((err) => {
        if ((err as { name?: string }).name === 'AbortError') return
        setError('Failed to load courses.')
        console.error(err)
      })
      .finally(() => setIsLoading(false))

    return () => controller.abort()
  }, [actionType, filters.search, filters.status, filters.audienceType, page])

  const courses = useMemo(
    () => sortCourses(rawCourses, filters.sortBy),
    [rawCourses, filters.sortBy],
  )

  function handleFiltersChange(next: CourseFilterState) {
    setFilters(next)
    setPage(1)
  }

  return {
    courses,
    filters,
    onFiltersChange: handleFiltersChange,
    page,
    totalPages,
    onPageChange: setPage,
    totalItems,
    allItemsCount: totalItems,
    pageSize,
    isLoading,
    error,
  }
}