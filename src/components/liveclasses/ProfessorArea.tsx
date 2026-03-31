import { cn } from '@/lib/utils'
import { StudentCharacter } from './StudentCharacter'
import { AIWidget } from './AIWidget'
import type { ApiParticipant, ApiAIAgent } from '@/lib/liveClassApi'

interface ProfessorAreaProps {
  professorParticipant: ApiParticipant | null
  professorName: string | null
  aiAgent: ApiAIAgent | null
  professorPresent: boolean
  onClickProfessor: () => void
  onClickAI: () => void
}

export function ProfessorArea({
  professorParticipant,
  professorName,
  aiAgent,
  professorPresent,
  onClickProfessor,
  onClickAI,
}: ProfessorAreaProps) {
  const showAIInChair = !professorPresent && aiAgent?.can_lead_sessions

  return (
    <div className="flex flex-col items-center gap-3 pb-6">
      {/* Blackboard / screen */}
      <div className="flex h-10 w-full max-w-lg items-center justify-center rounded-lg bg-slate-700 shadow-inner">
        <span className="text-xs font-medium text-slate-300 tracking-wider uppercase">Blackboard</span>
      </div>

      {/* Desk + characters */}
      <div className="flex items-end gap-6">
        {/* AI mac mini on desk */}
        {aiAgent && (
          <div className="mb-1">
            <AIWidget
              agentName={aiAgent.name}
              canAnswer={aiAgent.can_answer_students}
              onClick={onClickAI}
            />
          </div>
        )}

        {/* Professor desk */}
        <button
          onClick={professorPresent ? onClickProfessor : undefined}
          disabled={!professorPresent}
          className={cn(
            'flex flex-col items-center gap-2 rounded-2xl border-2 bg-amber-50 px-8 py-3 shadow-md transition-all dark:bg-amber-950/20',
            professorPresent
              ? 'cursor-pointer border-amber-300 hover:border-amber-500 hover:shadow-lg dark:border-amber-700'
              : 'cursor-default border-amber-200/50 dark:border-amber-800/30',
          )}
        >
          {showAIInChair ? (
            /* AI professor sits in the chair */
            <div className="flex flex-col items-center gap-1">
              <div className="flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-violet-600 text-lg shadow-md">
                🤖
              </div>
              <span className="max-w-[72px] truncate text-center text-[10px] text-muted-foreground leading-tight">
                {aiAgent!.name}
              </span>
            </div>
          ) : (
            <StudentCharacter
              name={professorName || 'Professor'}
              color="#6366f1"
              isPresent={professorPresent}
              size="md"
            />
          )}
          <div className="h-px w-full bg-amber-200 dark:bg-amber-700/50" />
          <span className="text-[10px] font-medium text-amber-700 dark:text-amber-400">
            Professor's Desk
          </span>
        </button>
      </div>
    </div>
  )
}
