import { useEffect, useState } from 'react'
import { ChevronsUpDown, LogOut, UserCircle } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SidebarMenu, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar'
import {
  fetchAndSaveProfile,
  getProfile,
  type UserProfile,
} from '@/lib/auth'

function initials(profile: UserProfile | null): string {
  if (!profile) return '?'
  const name = profile.display_name || profile.full_name || profile.username
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

interface NavUserProps {
  onLogout: () => void
}

export function NavUser({ onLogout }: NavUserProps) {
  const { isMobile } = useSidebar()
  const [profile, setProfile] = useState<UserProfile | null>(getProfile)

  // If profile wasn't cached yet (e.g. hard refresh after login), fetch it once.
  useEffect(() => {
    if (profile) return
    fetchAndSaveProfile().then((p) => { if (p) setProfile(p) })
  }, [profile])

  const displayName = profile
    ? (profile.display_name || profile.full_name || profile.username)
    : 'Loading…'
  const subLabel = profile ? profile.email : ''
  const avatarSrc = profile?.avatar ?? ''

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            className="flex w-full items-center gap-2 rounded-md p-2 text-left text-sm
              hover:bg-sidebar-accent hover:text-sidebar-accent-foreground
              data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground
              focus-visible:outline-none"
          >
            <Avatar className="size-8 rounded-lg">
              <AvatarImage src={avatarSrc} alt={displayName} />
              <AvatarFallback className="rounded-lg">{initials(profile)}</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{displayName}</span>
              <span className="text-muted-foreground truncate text-xs">{subLabel}</span>
            </div>
            <ChevronsUpDown className="ml-auto size-4 shrink-0" />
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="size-8 rounded-lg">
                    <AvatarImage src={avatarSrc} alt={displayName} />
                    <AvatarFallback className="rounded-lg">{initials(profile)}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{displayName}</span>
                    <span className="text-muted-foreground truncate text-xs">{subLabel}</span>
                  </div>
                </div>
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
      </SidebarMenuItem>
    </SidebarMenu>
  )
}