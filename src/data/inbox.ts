import { faker } from '@faker-js/faker'

faker.seed(55)

export type Folder = 'inbox' | 'starred' | 'sent' | 'drafts' | 'spam'

export interface Contact {
  id: string
  name: string
  email: string
}

export interface Message {
  id: string
  from: Contact
  to: Contact[]
  body: string
  sentAt: Date
}

export interface Thread {
  id: string
  subject: string
  messages: Message[]
  folder: Folder
  isRead: boolean
  isStarred: boolean
}

// ── Helpers ────────────────────────────────────────────────────────────────

const ME: Contact = {
  id: 'me',
  name: 'Alex Student',
  email: 'alex@ai-academy.dev',
}

function contact(): Contact {
  return {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email().toLowerCase(),
  }
}

function ago(minutes: number): Date {
  return new Date(Date.now() - minutes * 60 * 1000)
}

const BODIES = [
  `Hi Alex,\n\nJust following up on our discussion about the upcoming project deadline. I wanted to make sure we're aligned on the deliverables before the end of the week.\n\nLet me know if you have any questions or need any clarification.\n\nBest,`,
  `Hello,\n\nThank you for attending today's live session! The recording will be available within 24 hours. Please review the exercises we covered and submit your solutions by Friday.\n\nIf you have any questions about the material, feel free to reply to this email or post in the course forum.\n\nCheers,`,
  `Hey Alex,\n\nI noticed you haven't completed the mid-term review yet. The deadline is this Sunday at midnight. Don't forget — it counts for 20% of your final grade!\n\nHang in there,`,
  `Dear Alex,\n\nYour assignment submission has been received and is currently under review. You'll receive your grade and feedback within 5 business days.\n\nThank you for your hard work!\n\nWarm regards,`,
  `Hi there,\n\nYour study group has a new message from Maria Santos. She's proposing to move Thursday's session to 4pm instead of 3pm. Please reply in the group chat to confirm.\n\nAll the best,`,
  `Alex,\n\nReminder: your subscription renews in 3 days. Make sure your payment method is up to date to avoid any interruption in access.\n\nThanks,`,
  `Hi Alex,\n\nCongratulations! You've earned the "Fast Learner" badge for completing 5 lessons in a single day. Keep up the great work!\n\nThe AI Academy Team`,
  `Dear Student,\n\nThe course "Advanced Python Programming" starts in 7 days. Here's what you need to prepare:\n\n1. Install Python 3.11+\n2. Set up a virtual environment\n3. Review the pre-reading materials in the course portal\n\nSee you there!`,
  `Hello Alex,\n\nYour question in the forum has received 3 new replies. Check out what your peers and the instructor have to say!\n\nBest,`,
  `Hi,\n\nWe're excited to announce a new live Q&A session with the course instructor this Friday at 6pm UTC. Register now to reserve your spot — limited to 50 participants.\n\nSee you there,`,
]

function thread(
  subject: string,
  from: Contact,
  body: string,
  minutesAgo: number,
  folder: Folder,
  isRead: boolean,
  isStarred = false,
  replyBody?: string,
): Thread {
  const messages: Message[] = [
    {
      id: faker.string.uuid(),
      from,
      to: [ME],
      body: `${body}\n${from.name}`,
      sentAt: ago(minutesAgo + (replyBody ? 30 : 0)),
    },
  ]
  if (replyBody) {
    messages.push({
      id: faker.string.uuid(),
      from: ME,
      to: [from],
      body: replyBody,
      sentAt: ago(minutesAgo),
    })
  }
  return {
    id: faker.string.uuid(),
    subject,
    messages,
    folder,
    isRead,
    isStarred,
  }
}

// ── Fake threads ───────────────────────────────────────────────────────────

const instructor  = contact()
const ta          = contact()
const admin       = { id: faker.string.uuid(), name: 'AI Academy', email: 'no-reply@ai-academy.dev' }
const classmate   = contact()
const billing     = { id: faker.string.uuid(), name: 'Billing Team', email: 'billing@ai-academy.dev' }

export const fakeThreads: Thread[] = [
  thread('Re: Project deadline — quick check-in',   instructor, BODIES[0], 12,    'inbox',   false, true,
    "Hi!\n\nThanks for the heads-up. I've updated the task board and everything is on track for Friday.\n\nAlex"),
  thread('Live session recording now available',     ta,         BODIES[1], 45,    'inbox',   false),
  thread('⚠️ Mid-term review due Sunday!',            ta,         BODIES[2], 120,   'inbox',   false, true),
  thread('Assignment received — under review',       admin,      BODIES[3], 200,   'inbox',   true),
  thread('Study group: time change proposal',        classmate,  BODIES[4], 330,   'inbox',   true,  true),
  thread('Subscription renewal reminder',            billing,    BODIES[5], 1440,  'inbox',   true),
  thread('🏅 You earned the Fast Learner badge!',    admin,      BODIES[6], 2880,  'inbox',   true),
  thread('Advanced Python starts in 7 days',         instructor, BODIES[7], 4320,  'inbox',   true),
  thread('New replies to your forum question',       admin,      BODIES[8], 7200,  'inbox',   true),
  thread('New live Q&A session — register now',      admin,      BODIES[9], 10080, 'inbox',   true),

  // Starred (appear in starred folder too)
  thread('Office hours this week — slots available', instructor, BODIES[0], 60,    'inbox',   false, true),

  // Sent
  {
    id: faker.string.uuid(),
    subject: 'Question about Week 3 assignment',
    folder: 'sent',
    isRead: true,
    isStarred: false,
    messages: [{
      id: faker.string.uuid(),
      from: ME,
      to: [instructor],
      body: `Hi,\n\nI had a question about the Week 3 assignment — specifically task 2b. The instructions say to "normalise the dataset" but I'm not sure if that means min-max scaling or z-score standardisation in this context.\n\nThanks,\nAlex`,
      sentAt: ago(480),
    }],
  },
  {
    id: faker.string.uuid(),
    subject: 'Re: Study group: time change proposal',
    folder: 'sent',
    isRead: true,
    isStarred: false,
    messages: [{
      id: faker.string.uuid(),
      from: ME,
      to: [classmate],
      body: `Hey,\n\n4pm works great for me! I'll update the calendar invite.\n\nSee you Thursday,\nAlex`,
      sentAt: ago(300),
    }],
  },

  // Drafts
  {
    id: faker.string.uuid(),
    subject: 'Feedback on the course structure',
    folder: 'drafts',
    isRead: true,
    isStarred: false,
    messages: [{
      id: faker.string.uuid(),
      from: ME,
      to: [instructor],
      body: `Hi,\n\nI wanted to share some feedback on the course structure so far...\n\n[Draft — not sent]`,
      sentAt: ago(90),
    }],
  },

  // Spam
  {
    id: faker.string.uuid(),
    subject: 'You WON a free course — claim now!!!',
    folder: 'spam',
    isRead: false,
    isStarred: false,
    messages: [{
      id: faker.string.uuid(),
      from: { id: faker.string.uuid(), name: 'Free Courses 4U', email: 'promo@totally-legit.biz' },
      to: [ME],
      body: `CONGRATULATIONS!! You have been selected to receive a FREE online course worth $999! Click here to claim your prize immediately!!!`,
      sentAt: ago(600),
    }],
  },
]

// ── Derived ────────────────────────────────────────────────────────────────

export function getThreadsByFolder(folder: Folder): Thread[] {
  if (folder === 'starred') return fakeThreads.filter((t) => t.isStarred)
  return fakeThreads.filter((t) => t.folder === folder)
}

export function unreadCount(folder: Folder): number {
  return getThreadsByFolder(folder).filter((t) => !t.isRead).length
}