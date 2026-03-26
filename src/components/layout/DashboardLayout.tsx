import type { ReactNode } from 'react'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/AppSidebar'
import { TopBar } from '@/components/layout/TopBar'
import type { PageId } from '@/App'

interface DashboardLayoutProps {
  children: ReactNode
  title?: string
  activePage: PageId
  onNavigate: (page: PageId) => void
}

export function DashboardLayout({ children, title, activePage, onNavigate }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar activePage={activePage} onNavigate={onNavigate} />
      <SidebarInset>
        <TopBar title={title} />
        <main className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}