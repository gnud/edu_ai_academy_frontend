import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { CoursesPage } from '@/pages/CoursesPage'

export type PageId = 'dashboard' | 'courses' | 'live-classes' | 'messages' | 'groups' | 'ai-tutor'

function PageContent({ page }: { page: PageId }) {
  switch (page) {
    case 'courses':
      return <CoursesPage />
    default:
      return (
        <div className="flex flex-col gap-4">
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div className="bg-muted/50 aspect-video rounded-xl" />
            <div className="bg-muted/50 aspect-video rounded-xl" />
            <div className="bg-muted/50 aspect-video rounded-xl" />
          </div>
          <div className="bg-muted/50 min-h-96 flex-1 rounded-xl" />
        </div>
      )
  }
}

const PAGE_TITLES: Record<PageId, string> = {
  dashboard: 'Dashboard',
  courses: 'My Courses',
  'live-classes': 'Live Classes',
  messages: 'Messages',
  groups: 'Study Groups',
  'ai-tutor': 'AI Tutor',
}

function App() {
  const [page, setPage] = useState<PageId>('courses')

  return (
    <DashboardLayout title={PAGE_TITLES[page]} activePage={page} onNavigate={setPage}>
      <PageContent page={page} />
    </DashboardLayout>
  )
}

export default App