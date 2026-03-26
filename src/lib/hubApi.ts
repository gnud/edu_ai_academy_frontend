/**
 * Types for GET /api/hub/ response.
 */

export interface HubStats {
  in_the_mix: number
  on_deck: number
  graduated: number
  dropped: number
}

export interface HubClassroom {
  id: number
  name: string
  slug: string
}

export interface HubSession {
  id: number
  title: string
  description: string
  status: 'scheduled' | 'live' | 'ended' | 'canceled'
  starts_at: string
  ends_at: string | null
  duration_minutes: number | null
  classroom: HubClassroom | null
  course_title: string
  course_slug: string
  semester_name: string
  professor_name: string | null
  created_at: string
}

export interface HubSemester {
  id: number
  name: string
  status: string
  enrollment_open: boolean
  max_students: number | null
  starts_on: string | null
  ends_on: string | null
}

export interface HubCourse {
  id: number
  title: string
  slug: string
  short_description: string
  audience_type: string
  is_active: boolean
  is_published: boolean
  created_by: string
  created_at: string
  active_semester: HubSemester | null
}

export interface HubEnrollment {
  id: number
  role: string
  status: string
  joined_at: string
  semester: HubSemester
  course: HubCourse
}

export interface HubData {
  stats: HubStats
  upcoming_classes: HubSession[]
  scheduled: HubEnrollment[]
  archive: HubEnrollment[]
}