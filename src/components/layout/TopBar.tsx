import { Bell, Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'

interface TopBarProps {
  title?: string
}

export function TopBar({ title = 'Dashboard' }: TopBarProps) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />

      <span className="font-semibold text-sm">{title}</span>

      <div className="ml-auto flex items-center gap-2">
        <div className="relative hidden sm:block">
          <Search className="text-muted-foreground absolute left-2.5 top-2.5 size-4" />
          <Input
            type="search"
            placeholder="Search courses..."
            className="w-56 pl-8 text-sm"
          />
        </div>

        <Button variant="ghost" size="icon" className="relative">
          <Bell className="size-4" />
          <Badge className="absolute -right-1 -top-1 flex size-4 items-center justify-center p-0 text-[10px]">
            3
          </Badge>
        </Button>
      </div>
    </header>
  )
}