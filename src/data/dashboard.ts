import { faker } from '@faker-js/faker'
import { fakeCourses } from '@/data/courses'

export interface ClassSession {
  id: string
  courseTitle: string
  instructorName: string
  startsAt: Date
  durationMinutes: number
  topic: string
  isLive: boolean
}

faker.seed(77)

const TODAY = new Date()

function daysFromNow(days: number, hour: number, minute = 0): Date {
  const d = new Date(TODAY)
  d.setDate(d.getDate() + days)
  d.setHours(hour, minute, 0, 0)
  return d
}

const SESSION_TOPICS = [
  'Introduction & Overview',
  'Core Concepts Deep Dive',
  'Live Coding Workshop',
  'Q&A and Office Hours',
  'Guest Lecture',
  'Project Review',
  'Lab Session',
  'Midterm Review',
]

export const fakeUpcomingSessions: ClassSession[] = [
  { id: faker.string.uuid(), courseTitle: 'Introduction to Machine Learning', instructorName: 'Dr. Elena Marsh',  startsAt: daysFromNow(0, 14),    durationMinutes: 60,  topic: 'Live Coding Workshop',     isLive: true  },
  { id: faker.string.uuid(), courseTitle: 'React & TypeScript Fundamentals', instructorName: 'Carlos Reyes',    startsAt: daysFromNow(0, 17),    durationMinutes: 90,  topic: 'Component Patterns Q&A',   isLive: false },
  { id: faker.string.uuid(), courseTitle: 'Advanced Python Programming',     instructorName: 'Priya Nair',      startsAt: daysFromNow(1, 10),    durationMinutes: 60,  topic: 'Async / Await Deep Dive',  isLive: false },
  { id: faker.string.uuid(), courseTitle: 'Web Security Essentials',         instructorName: 'James Liu',       startsAt: daysFromNow(1, 15, 30),durationMinutes: 75,  topic: 'OWASP Top 10 Walkthrough', isLive: false },
  { id: faker.string.uuid(), courseTitle: 'Database Design & SQL',           instructorName: 'Sofia Andersen',  startsAt: daysFromNow(2, 9),     durationMinutes: 60,  topic: 'Query Optimisation Lab',   isLive: false },
  { id: faker.string.uuid(), courseTitle: 'Cloud Architecture on AWS',       instructorName: 'Marcus Webb',     startsAt: daysFromNow(3, 13),    durationMinutes: 90,  topic: 'VPC & IAM Workshop',       isLive: false },
  { id: faker.string.uuid(), courseTitle: 'DevOps & CI/CD Pipelines',        instructorName: 'Aiko Tanaka',     startsAt: daysFromNow(4, 11),    durationMinutes: 60,  topic: 'GitHub Actions Lab',       isLive: false },
  { id: faker.string.uuid(), courseTitle: 'Data Structures and Algorithms',  instructorName: 'Noah Berger',     startsAt: daysFromNow(5, 16),    durationMinutes: 75,  topic: 'Graph Traversal Review',   isLive: false },
]
// Fill remaining with random sessions to make the list richer
for (let i = 0; i < 4; i++) {
  fakeUpcomingSessions.push({
    id: faker.string.uuid(),
    courseTitle: faker.helpers.arrayElement(fakeCourses).title,
    instructorName: faker.person.fullName(),
    startsAt: daysFromNow(faker.number.int({ min: 1, max: 7 }), faker.number.int({ min: 8, max: 18 })),
    durationMinutes: faker.helpers.arrayElement([45, 60, 75, 90]),
    topic: faker.helpers.arrayElement(SESSION_TOPICS),
    isLive: false,
  })
}
fakeUpcomingSessions.sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime())

// ── Derived stats from fakeCourses ──────────────────────────────────────────
export const dashboardStats = {
  inTheMix:   fakeCourses.filter((c) => c.status === 'active').length,
  onDeck:     fakeCourses.filter((c) => c.status === 'scheduled').length,
  graduated:  fakeCourses.filter((c) => c.status === 'completed').length,
  hoursIn:    faker.number.int({ min: 40, max: 280 }),
  dayStreak:  faker.number.int({ min: 3, max: 42 }),
}