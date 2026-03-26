import { faker } from '@faker-js/faker'

export type CourseStatus = 'active' | 'scheduled' | 'completed' | 'cancelled'
export type AudienceType = 'students' | 'teachers' | 'mixed'

export interface Course {
  id: string
  title: string
  description: string
  instructorName: string
  instructorAvatar: string
  thumbnail: string
  status: CourseStatus
  audienceType: AudienceType
  progress: number        // 0–100, meaningful only for active/completed
  enrolledStudents: number
  maxStudents: number | null
  startDate: string
  endDate: string | null
  tags: string[]
}

const COURSE_TITLES = [
  'Introduction to Machine Learning',
  'Advanced Python Programming',
  'React & TypeScript Fundamentals',
  'Data Structures and Algorithms',
  'Web Security Essentials',
  'Deep Learning with PyTorch',
  'Cloud Architecture on AWS',
  'UX Design Principles',
  'Agile Project Management',
  'Database Design & SQL',
  'GraphQL API Development',
  'DevOps & CI/CD Pipelines',
  'Natural Language Processing',
  'Mobile App Development with React Native',
  'Microservices with Docker & Kubernetes',
  'Functional Programming in Haskell',
  'Computer Vision Fundamentals',
  'Blockchain & Smart Contracts',
  'System Design Interviews',
  'Ethical AI & Responsible ML',
]

const TAGS = [
  'python', 'machine-learning', 'react', 'typescript', 'sql', 'aws',
  'docker', 'design', 'algorithms', 'security', 'nlp', 'devops',
  'mobile', 'blockchain', 'ai', 'data-science', 'web', 'backend',
]

const STATUSES: CourseStatus[] = ['active', 'scheduled', 'completed', 'cancelled']
const AUDIENCES: AudienceType[] = ['students', 'teachers', 'mixed']

faker.seed(42)

function generateCourse(index: number): Course {
  const status = STATUSES[index % 4] ?? faker.helpers.arrayElement(STATUSES)
  const isCompleted = status === 'completed'
  const isActive = status === 'active'

  const startDate = faker.date.past({ years: 1 })
  const endDate = faker.datatype.boolean(0.8)
    ? faker.date.between({ from: startDate, to: new Date(startDate.getTime() + 1000 * 60 * 60 * 24 * 120) })
    : null

  return {
    id: faker.string.uuid(),
    title: COURSE_TITLES[index % COURSE_TITLES.length]!,
    description: faker.lorem.sentences(2),
    instructorName: faker.person.fullName(),
    instructorAvatar: `https://api.dicebear.com/9.x/avataaars/svg?seed=${faker.string.alphanumeric(8)}`,
    thumbnail: `https://picsum.photos/seed/${faker.string.alphanumeric(6)}/400/225`,
    status,
    audienceType: faker.helpers.arrayElement(AUDIENCES),
    progress: isCompleted ? 100 : isActive ? faker.number.int({ min: 5, max: 95 }) : 0,
    enrolledStudents: faker.number.int({ min: 8, max: 120 }),
    maxStudents: faker.datatype.boolean(0.6) ? faker.number.int({ min: 20, max: 150 }) : null,
    startDate: startDate.toISOString(),
    endDate: endDate ? endDate.toISOString() : null,
    tags: faker.helpers.arrayElements(TAGS, { min: 2, max: 4 }),
  }
}

export const fakeCourses: Course[] = Array.from({ length: 18 }, (_, i) => generateCourse(i))