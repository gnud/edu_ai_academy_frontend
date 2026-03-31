import { Users, UserCheck, UserX, GraduationCap } from 'lucide-react'
import type { ApiParticipant } from '@/lib/liveClassApi'

interface GroupingBannerProps {
  professorName: string | null
  students: ApiParticipant[]
  groupCount: number
}

export function GroupingBanner({ professorName, students, groupCount }: GroupingBannerProps) {
  const total  = students.length
  const absent = students.filter((s) => s.attendance_status !== 'joined').length
  const present = total - absent

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm dark:border-emerald-800 dark:bg-emerald-900/20">
      <span className="flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-300">
        <Users className="size-4" />
        Grouping Active
      </span>

      <div className="h-4 w-px bg-emerald-300 dark:bg-emerald-700" />

      <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-300">
        <UserCheck className="size-3.5" />
        {present} present
      </span>

      {absent > 0 && (
        <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
          <UserX className="size-3.5" />
          {absent} absent
        </span>
      )}

      <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-300">
        <Users className="size-3.5" />
        {groupCount} {groupCount === 1 ? 'group' : 'groups'}
      </span>

      {professorName && (
        <>
          <div className="h-4 w-px bg-emerald-300 dark:bg-emerald-700" />
          <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-300">
            <GraduationCap className="size-3.5" />
            {professorName}
          </span>
        </>
      )}
    </div>
  )
}
