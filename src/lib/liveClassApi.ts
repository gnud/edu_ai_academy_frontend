/** Django live-class API — response types. */

export interface ApiParticipant {
  id: number
  user_id: number | null
  username: string | null
  full_name: string
  avatar_color: string
  role: string               // student | professor | ...
  attendance_status: string  // invited | joined | left | absent
  joined_at: string | null
  left_at: string | null
}

export interface ApiAIAgent {
  id: number
  name: string
  can_answer_students: boolean
  can_lead_sessions: boolean
}

export interface ApiSession {
  id: number
  title: string
  description: string
  status: string  // scheduled | live | ended | canceled
  starts_at: string
  ends_at: string | null
  duration_minutes: number | null
  classroom: { id: number; name: string; slug: string }
  course_title: string
  course_slug: string
  semester_name: string
  professor_name: string | null
  professor_id: number | null
  created_at: string
  participants: ApiParticipant[]
  ai_agent: ApiAIAgent | null
}
