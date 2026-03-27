import {
  BookOpen,
  Bot,
  GraduationCap,
  KeyRound,
  LayoutDashboard,
  Library,
  MessageSquare,
  Settings,
  Users,
} from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import { NavUser } from '@/components/layout/NavUser'
import type { PageId } from '@/App'

interface NavItem {
  title: string
  pageId: PageId
  icon: React.ElementType
}

const navMain: { label: string; items: NavItem[] }[] = [
  {
    label: 'Learning',
    items: [
      { title: 'Dashboard', pageId: 'dashboard', icon: LayoutDashboard },
      { title: 'My Courses', pageId: 'courses', icon: BookOpen },
      { title: 'Course Catalog', pageId: 'catalog', icon: Library },
      { title: 'Live Classes', pageId: 'live-classes', icon: GraduationCap },
    ],
  },
  {
    label: 'Community',
    items: [
      { title: 'Messages', pageId: 'messages', icon: MessageSquare },
      { title: 'Study Groups', pageId: 'groups', icon: Users },
      { title: 'AI Tutor', pageId: 'ai-tutor', icon: Bot },
    ],
  },
  {
    label: 'Dev Tools',
    items: [
      { title: 'Auth Sandbox', pageId: 'auth-sandbox', icon: KeyRound },
    ],
  },
]

interface AppSidebarProps {
  activePage: PageId
  onNavigate: (page: PageId) => void
  onLogout: () => void
}

export function AppSidebar({ activePage, onNavigate, onLogout }: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<a href="#" />}>
              <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <GraduationCap className="size-4" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-semibold">AI Academy</span>
                <span className="text-muted-foreground text-xs">Student Portal</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {navMain.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      render={<button onClick={() => onNavigate(item.pageId)} />}
                      isActive={activePage === item.pageId}
                      tooltip={item.title}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton render={<button />} tooltip="Settings">
              <Settings />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <NavUser onLogout={onLogout} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
