import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { DashboardPage } from '@/pages/DashboardPage'
import { CoursesPage } from '@/pages/CoursesPage'
import { CatalogPage } from '@/pages/CatalogPage'
import { AuthSandboxPage } from '@/pages/AuthSandboxPage'
import { InboxPage } from '@/pages/InboxPage'

export type PageId =
  | 'dashboard'
  | 'courses'
  | 'catalog'
  | 'live-classes'
  | 'messages'
  | 'groups'
  | 'ai-tutor'
  | 'auth-sandbox'

function PageContent({ page }: { page: PageId }) {
  switch (page) {
    case 'dashboard':
      return <DashboardPage />
    case 'courses':
      return <CoursesPage />
    case 'catalog':
      return <CatalogPage />
    case 'messages':
      return <InboxPage />
    case 'auth-sandbox':
      return <AuthSandboxPage />
    default:
      return (
        <div className="flex flex-col gap-4">
          <div className="bg-muted/50 min-h-96 flex-1 rounded-xl" />
        </div>
      )
  }
}

const PAGE_TITLES: Record<PageId, string> = {
  dashboard: 'Dashboard',
  courses: 'My Courses',
  catalog: 'Course Catalog',
  'live-classes': 'Live Classes',
  messages: 'Messages',
  groups: 'Study Groups',
  'ai-tutor': 'AI Tutor',
  'auth-sandbox': 'Auth Sandbox',
}

function App() {
  const [page, setPage] = useState<PageId>('dashboard')

  return (
    <DashboardLayout title={PAGE_TITLES[page]} activePage={page} onNavigate={setPage}>
      <PageContent page={page} />
    </DashboardLayout>
  )
}

export default App