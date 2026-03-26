/**
 * Django API response types for course endpoints and mapping utilities.
 *
 * GET /api/courses/     → ApiCourseCatalogItem[]  (public catalog)
 * GET /api/courses/me/  → ApiMyCourseItem[]        (enrolled memberships)
 *
 * Both are wrapped in the StandardPagination envelope:
 *   { pagination: { count, page, page_size, pages, next, previous }, results: [...] }
 */

import type { Course, CourseStatus, AudienceType } from '@/data/courses'

// ── Pagination envelope ────────────────────────────────────────────────────

export interface ApiPagination {
  count: number
  page: number
  page_size: number
  pages: number
  next: string | null
  previous: string | null
}

export interface ApiPage<T> {
  pagination: ApiPagination
  results: T[]
}

// ── Catalog endpoint (/api/courses/) ──────────────────────────────────────

export interface ApiSemester {
  id: number
  name: string
  status: CourseStatus
  enrollment_open: boolean
  max_students: number | null
  starts_on: string | null
  ends_on: string | null
}

export interface ApiCourseCatalogItem {
  id: number
  title: string
  slug: string
  short_description: string
  is_published: boolean
  is_active: boolean
  audience: AudienceType
  active_semester: ApiSemester | null
}

// ── My courses endpoint (/api/courses/me/) ────────────────────────────────

export interface ApiMyCourseNestedCourse {
  id: number
  title: string
  slug: string
}

export interface ApiMyCourseItem {
  id: number
  role: string
  status: string        // membership status: active | completed | dropped | invited
  joined_at: string
  semester: ApiSemester
  course: ApiMyCourseNestedCourse
}

// ── Mapping helpers ────────────────────────────────────────────────────────

// Picsum placeholder so cards always have an image, keyed by id so it's stable.
function placeholderThumbnail(id: number): string {
  return `https://picsum.photos/seed/course-${id}/640/360`
}

export function mapCatalogItem(item: ApiCourseCatalogItem): Course {
  const sem = item.active_semester
  return {
    id: String(item.id),
    title: item.title,
    description: item.short_description,
    instructorName: 'Instructor',
    instructorAvatar: '',
    thumbnail: placeholderThumbnail(item.id),
    status: sem?.status ?? 'scheduled',
    audienceType: item.audience,
    progress: 0,
    enrolledStudents: 0,
    maxStudents: sem?.max_students ?? null,
    startDate: sem?.starts_on ?? new Date().toISOString(),
    endDate: sem?.ends_on ?? null,
    tags: [],
  }
}

export function mapMyCourseItem(item: ApiMyCourseItem): Course {
  // Map membership status → CourseStatus for the card badge
  const statusMap: Record<string, CourseStatus> = {
    active:    'active',
    completed: 'completed',
    dropped:   'cancelled',
    invited:   'scheduled',
  }
  return {
    id: String(item.id),
    title: item.course.title,
    description: '',
    instructorName: 'Instructor',
    instructorAvatar: '',
    thumbnail: placeholderThumbnail(item.course.id),
    status: statusMap[item.status] ?? 'active',
    audienceType: 'students',
    progress: item.status === 'completed' ? 100 : 0,
    enrolledStudents: 0,
    maxStudents: item.semester.max_students ?? null,
    startDate: item.semester.starts_on ?? new Date().toISOString(),
    endDate: item.semester.ends_on ?? null,
    tags: [],
  }
}