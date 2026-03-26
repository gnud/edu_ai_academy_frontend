import { StatsCards } from '@/components/dashboard/StatsCards'
import { UpcomingClasses } from '@/components/dashboard/UpcomingClasses'
import { ScheduledSection } from '@/components/dashboard/ScheduledSection'
import { ArchiveSection } from '@/components/dashboard/ArchiveSection'

export function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Welcome back — here's where things stand.</p>
      </div>

      <StatsCards />

      {/* Two-column layout: upcoming sessions + scheduled courses */}
      <div className="grid gap-6 lg:grid-cols-2">
        <UpcomingClasses />
        <ScheduledSection />
      </div>

      <ArchiveSection />
    </div>
  )
}