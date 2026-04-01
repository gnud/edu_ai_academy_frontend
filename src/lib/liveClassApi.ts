/** Django live-class API — response types. */

export interface ApiBlackboardFile {
  id: number
  name: string
  file_type: 'text' | 'markdown' | 'pdf' | 'image' | 'video' | 'audio'
  url: string
  uploaded_at: string
}

export interface ApiBlackboardState {
  active_file:   ApiBlackboardFile | null
  is_fullscreen: boolean
  is_live:       boolean
  scroll_y:      number
  zoom:          number
  rotation:      number
  media_playing: boolean
}

export interface ApiGroupMember {
  id: number
  user_id: number | null
  full_name: string
  avatar_color: string
  role: string
}

export interface ApiGroup {
  id: number
  name: string
  is_active: boolean
  thread_id: number | null
  member_count: number
  members: ApiGroupMember[]
  created_at: string
}

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
  grouping_active: boolean
  participants: ApiParticipant[]
  ai_agent: ApiAIAgent | null
  groups: ApiGroup[]
}
