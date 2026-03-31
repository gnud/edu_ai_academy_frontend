import { Bot } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AIWidgetProps {
  agentName: string
  canAnswer: boolean
  onClick: () => void
}

export function AIWidget({ agentName, canAnswer, onClick }: AIWidgetProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'group flex flex-col items-center gap-1 rounded-xl border-2 bg-gradient-to-b px-3 py-2 shadow-md transition-all',
        canAnswer
          ? 'border-violet-300 from-violet-50 to-violet-100 hover:border-violet-500 hover:shadow-lg dark:border-violet-700 dark:from-violet-950/40 dark:to-violet-900/40'
          : 'cursor-not-allowed border-border from-muted/30 to-muted/50 opacity-60',
      )}
      title={canAnswer ? `Chat with ${agentName}` : 'AI chat unavailable for this course'}
    >
      {/* Mac mini body */}
      <div className={cn(
        'flex size-10 items-center justify-center rounded-lg shadow-inner',
        canAnswer
          ? 'bg-gradient-to-br from-violet-200 to-violet-300 dark:from-violet-800 dark:to-violet-700'
          : 'bg-muted',
      )}>
        <Bot className={cn('size-5', canAnswer ? 'text-violet-700 dark:text-violet-300' : 'text-muted-foreground')} />
      </div>
      <span className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
        AI
      </span>
    </button>
  )
}
