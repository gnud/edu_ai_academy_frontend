import { Bell, LogOut, Search, UserCircle } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { getProfile } from '@/lib/auth'

interface TopBarProps {
  title?: string
  onLogout: () => void
}

export function TopBar({ title = 'Dashboard', onLogout }: TopBarProps) {
  const profile = getProfile()
  const displayName = profile
    ? (profile.display_name || profile.full_name || profile.username)
    : 'Account'
  const initials = profile
    ? displayName.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()
    : 'U'
  const label = displayName

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />

      <span className="font-semibold text-sm">{title}</span>

      <div className="ml-auto flex items-center gap-1">
        <div className="relative hidden sm:block">
          <Search className="text-muted-foreground absolute left-2.5 top-2.5 size-4" />
          <Input
            type="search"
            placeholder="Search courses..."
            className="w-56 pl-8 text-sm"
          />
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="size-4" />
          <Badge className="absolute -right-1 -top-1 flex size-4 items-center justify-center p-0 text-[10px]">
            3
          </Badge>
        </Button>

        {/* Avatar dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className="flex size-8 items-center justify-center rounded-full hover:bg-accent focus-visible:outline-none"
          >
            <Avatar className="size-7">
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal">
                <p className="text-sm font-semibold">{label}</p>
                <p className="text-xs text-muted-foreground">Signed in</p>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <UserCircle className="mr-2 size-4" />
                Profile
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={onLogout}
                className="text-red-600 focus:text-red-600"
              >
                <LogOut className="mr-2 size-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}