import { BookOpen, CalendarClock, GraduationCap, XCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { HubStats } from '@/lib/hubApi'

// import { dashboardStats } from '@/data/dashboard'

interface StatCardProps {
  label: string
  value: number | string
  sub: string
  icon: React.ElementType
  accent?: string
}

function StatCard({ label, value, sub, icon: Icon, accent = 'text-primary' }: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
            {label}
          </span>
          <span className="text-3xl font-bold leading-none">{value}</span>
          <span className="text-muted-foreground text-xs">{sub}</span>
        </div>
        <div className={`rounded-lg bg-muted p-2 ${accent}`}>
          <Icon className="size-5" />
        </div>
      </CardContent>
    </Card>
  )
}

interface StatsCardsProps {
  stats: HubStats
  isLoading?: boolean
}

export function StatsCards({ stats, isLoading = false }: StatsCardsProps) {
  const s = stats

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <div className="bg-muted h-16 animate-pulse rounded-lg" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="In the Mix"
        value={s.in_the_mix}
        sub="active courses"
        icon={BookOpen}
        accent="text-green-600"
      />
      <StatCard
        label="On Deck"
        value={s.on_deck}
        sub="scheduled upcoming"
        icon={CalendarClock}
        accent="text-blue-600"
      />
      <StatCard
        label="Graduated"
        value={s.graduated}
        sub="courses completed"
        icon={GraduationCap}
        accent="text-violet-600"
      />
      <StatCard
        label="Dropped"
        value={s.dropped}
        sub="cancelled or dropped"
        icon={XCircle}
        accent="text-red-500"
      />
    </div>
  )
}