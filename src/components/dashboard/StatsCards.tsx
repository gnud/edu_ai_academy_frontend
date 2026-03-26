import { BookOpen, CalendarClock, Clock, Flame, GraduationCap } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { dashboardStats } from '@/data/dashboard'

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

export function StatsCards() {
  const s = dashboardStats

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <StatCard
        label="In the Mix"
        value={s.inTheMix}
        sub="active courses"
        icon={BookOpen}
        accent="text-green-600"
      />
      <StatCard
        label="On Deck"
        value={s.onDeck}
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
        label="Hours In"
        value={s.hoursIn}
        sub="total learning time"
        icon={Clock}
        accent="text-amber-600"
      />
      <StatCard
        label="Day Streak"
        value={`${s.dayStreak}🔥`}
        sub="consecutive days"
        icon={Flame}
        accent="text-orange-600"
      />
    </div>
  )
}