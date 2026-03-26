import { useHub } from '@/hooks/useHub'
import { StatsCards } from '@/components/dashboard/StatsCards'
import { UpcomingClasses } from '@/components/dashboard/UpcomingClasses'
import { ScheduledSection } from '@/components/dashboard/ScheduledSection'
import { ArchiveSection } from '@/components/dashboard/ArchiveSection'

const EMPTY_STATS = { in_the_mix: 0, on_deck: 0, graduated: 0, dropped: 0 }

export function DashboardPage() {
  const { data, isLoading, error, refetch } = useHub()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm">Welcome back — here's where things stand.</p>
        </div>
        {error && (
          <button
            onClick={refetch}
            className="rounded-lg border px-3 py-1.5 text-xs font-medium transition hover:bg-muted"
          >
            Retry
          </button>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <StatsCards stats={data?.stats ?? EMPTY_STATS} isLoading={isLoading} />

      <div className="grid gap-6 lg:grid-cols-2">
        <UpcomingClasses sessions={data?.upcoming_classes ?? []} isLoading={isLoading} />
        <ScheduledSection items={data?.scheduled ?? []} isLoading={isLoading} />
      </div>

      <ArchiveSection items={data?.archive ?? []} isLoading={isLoading} />
    </div>
  )
}