import { useState, useEffect, useRef } from 'react'
import { ArrowLeft, Radio } from 'lucide-react'
import { api } from '@/lib/api'
import { getProfile } from '@/lib/auth'
import { useLiveClass } from '@/hooks/useLiveClass'
import { useClassroomChat } from '@/hooks/useClassroomChat'
import { useClassroomGroups } from '@/hooks/useClassroomGroups'
import { Classroom } from '@/components/liveclasses/Classroom'
import { ChatWindow } from '@/components/liveclasses/ChatWindow'
import { ChatTabBar } from '@/components/liveclasses/ChatTabBar'
import type { ApiGroup, ApiGroupMember, ApiSession, ApiParticipant } from '@/lib/liveClassApi'
import type { ApiPage } from '@/lib/inboxApi'

// ── Status badge ────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
  live:      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  scheduled: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  ended:     'bg-muted text-muted-foreground',
  canceled:  'bg-muted text-muted-foreground',
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${STATUS_STYLES[status] ?? ''}`}>
      {status === 'live' && <Radio className="size-3 animate-pulse" />}
      {status}
    </span>
  )
}

// ── Session list ─────────────────────────────────────────────────────────────

function SessionList({ onJoin }: { onJoin: (id: number) => void }) {
  const [sessions, setSessions] = useState<ApiSession[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    api.get<ApiPage<ApiSession>>('/classes/?page_size=50')
      .then((p) => { setSessions(p.results); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-sm text-muted-foreground">Loading sessions…</p>
  if (!sessions.length) return <p className="text-sm text-muted-foreground">No sessions available.</p>

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {sessions.map((s) => (
        <div key={s.id} className="flex flex-col gap-3 rounded-2xl border bg-background p-4 shadow-sm">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-sm">{s.title}</p>
              <p className="text-xs text-muted-foreground">{s.course_title}</p>
            </div>
            <StatusBadge status={s.status} />
          </div>
          <div className="text-xs text-muted-foreground">
            <p>{s.classroom.name}</p>
            {s.professor_name && <p>Prof. {s.professor_name}</p>}
            <p>{new Date(s.starts_at).toLocaleString()}</p>
          </div>
          <button
            onClick={() => onJoin(s.id)}
            disabled={s.status === 'canceled'}
            className="mt-auto rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-40"
          >
            {s.status === 'live' ? 'Join Live' : 'Enter Room'}
          </button>
        </div>
      ))}
    </div>
  )
}

// ── Classroom view ────────────────────────────────────────────────────────────

function ClassroomView({ sessionId, onBack }: { sessionId: number; onBack: () => void }) {
  const { session, studentParticipants, professorPresent, loading, error } = useLiveClass(sessionId)
  const { openWindows, minimizedWindows, openChat, minimizeChat, closeChat, restoreChat, markChatDeleted, mentionInChat, updateChatMembers } = useClassroomChat()
  const { groups, setGroups, createGroup, deleteGroup, setGroupingActive } = useClassroomGroups(sessionId)
  const autoOpenedGroupIds = useRef<Set<number>>(new Set())

  const myId        = getProfile()?.id ?? null
  const isProfessor = !!session && session.professor_id === myId

  // Auto-popup group chat when the current user is placed in a group.
  useEffect(() => {
    if (!myId) return
    for (const group of groups) {
      if (autoOpenedGroupIds.current.has(group.id)) continue
      const isMember = group.members.some((m) => m.user_id === myId) || isProfessor
      if (isMember && group.thread_id) {
        autoOpenedGroupIds.current.add(group.id)
        openChat({
          userId: -(group.id),
          name: group.name,
          avatarColor: '#8b5cf6',
          threadId: String(group.thread_id),
          isGroup: true,
          members: group.members.map((m) => ({ id: m.user_id ?? undefined, memberId: m.id, name: m.full_name, color: m.avatar_color, role: m.role })),
        })
      }
    }
  }, [groups, myId, isProfessor, openChat])

  // Sync group chat window member lists with latest poll data.
  useEffect(() => {
    for (const group of groups) {
      updateChatMembers(
        -(group.id),
        group.members.map((m) => ({ id: m.user_id ?? undefined, memberId: m.id, name: m.full_name, color: m.avatar_color, role: m.role })),
      )
    }
  }, [groups, updateChatMembers])

  // Mark group chat windows as deleted when the group is removed from the list.
  useEffect(() => {
    const activeGroupUserIds = new Set(groups.map((g) => -(g.id)))
    const allWindows = [...openWindows, ...minimizedWindows]
    for (const w of allWindows) {
      if (w.isGroup && !w.deleted && !activeGroupUserIds.has(w.userId)) {
        markChatDeleted(w.userId)
      }
    }
  }, [groups, openWindows, minimizedWindows, markChatDeleted])

  if (loading) return <p className="text-sm text-muted-foreground">Loading classroom…</p>
  if (error || !session) return <p className="text-sm text-red-500">{error ?? 'Session not found.'}</p>

  const professorParticipant = session.participants.find(
    (p) => p.role === 'professor' && p.user_id !== null,
  ) ?? null

  function handleClickStudent(p: ApiParticipant) {
    if (!p.user_id) return
    openChat({ userId: p.user_id, name: p.full_name, avatarColor: p.avatar_color })
  }

  function handleClickProfessor() {
    if (!session?.professor_id) return
    const name = session.professor_name ?? 'Professor'
    openChat({ userId: session.professor_id, name, avatarColor: '#6366f1' })
  }

  function handleClickAI() {
    if (!session?.ai_agent?.can_answer_students) return
    alert(`AI chat with ${session.ai_agent.name} coming soon.`)
  }

  async function handleCreateGroup(name: string, participantIds: number[]) {
    await createGroup(name, participantIds)
  }

  async function handleDeleteGroup(groupId: number) {
    await deleteGroup(groupId)
  }

  function handlePMMember(member: ApiGroupMember) {
    if (!member.user_id) return
    openChat({ userId: member.user_id, name: member.full_name, avatarColor: member.avatar_color })
  }

  function handleMentionMember(member: ApiGroupMember, groupId: number) {
    mentionInChat(-(groupId), `@${member.full_name} `)
  }

  async function handleKickMember(member: ApiGroupMember, groupId: number) {
    if (!sessionId) return
    try {
      await api.delete(`/classes/${sessionId}/groups/${groupId}/members/${member.id}/`)
    } catch { /* endpoint not yet implemented — silently ignore */ }
  }

  function handleTransferMember(_member: ApiGroupMember, _fromGroupId: number) { // eslint-disable-line @typescript-eslint/no-unused-vars
    // TODO: open transfer dialog to select target group
    alert('Transfer coming soon.')
  }

  function handleOpenGroupChat(group: ApiGroup) {
    if (!group.thread_id) return
    openChat({
      userId: -(group.id),
      name: group.name,
      avatarColor: '#8b5cf6',
      threadId: String(group.thread_id),
      isGroup: true,
      members: group.members.map((m) => ({ id: m.user_id ?? undefined, memberId: m.id, name: m.full_name, color: m.avatar_color, role: m.role })),
    })
  }

  async function handleActivateGrouping() {
    if (!session) return
    await setGroupingActive(true)
    session.grouping_active = true
  }

  async function handleDeactivateGrouping() {
    if (!session) return
    await setGroupingActive(false)
    session.grouping_active = false
    setGroups([])
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1 rounded-full px-3 py-1.5 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Back
        </button>
        <div className="flex-1">
          <h2 className="font-semibold">{session.title}</h2>
          <p className="text-xs text-muted-foreground">{session.course_title} · {session.classroom.name}</p>
        </div>
        <StatusBadge status={session.status} />
      </div>

      {/* Classroom */}
      <Classroom
        session={session}
        students={studentParticipants}
        professorParticipant={professorParticipant}
        professorPresent={professorPresent}
        isProfessor={isProfessor}
        groups={groups}
        onClickStudent={handleClickStudent}
        onClickProfessor={handleClickProfessor}
        onClickAI={handleClickAI}
        onCreateGroup={handleCreateGroup}
        onDeleteGroup={handleDeleteGroup}
        onOpenGroupChat={handleOpenGroupChat}
        onActivateGrouping={handleActivateGrouping}
        onDeactivateGrouping={handleDeactivateGrouping}
        onPMMember={handlePMMember}
        onMentionMember={handleMentionMember}
        onKickMember={handleKickMember}
        onTransferMember={handleTransferMember}
      />

      {/* Floating chat windows */}
      {openWindows.map((w, i) => (
        <ChatWindow
          key={w.userId}
          threadId={w.threadId}
          targetName={w.name}
          avatarColor={w.avatarColor}
          isGroup={w.isGroup}
          members={w.members}
          deleted={w.deleted}
          pendingMention={w.pendingMention}
          isProfessor={isProfessor}
          index={i}
          onMinimize={() => minimizeChat(w.userId)}
          onClose={() => closeChat(w.userId)}
          onMentionConsumed={() => mentionInChat(w.userId, '')}
          onPMMember={handlePMMember}
          onMentionMember={(m) => handleMentionMember(m, -(w.userId))}
          onKickMember={(m) => handleKickMember(m, -(w.userId))}
          onTransferMember={(m) => handleTransferMember(m, -(w.userId))}
        />
      ))}

      {/* Minimized tabs */}
      <ChatTabBar
        minimized={minimizedWindows}
        onRestore={restoreChat}
        onClose={closeChat}
      />
    </div>
  )
}

// ── Page root ─────────────────────────────────────────────────────────────────

export function LiveClassPage() {
  const [sessionId, setSessionId] = useState<number | null>(null)

  return sessionId
    ? <ClassroomView sessionId={sessionId} onBack={() => setSessionId(null)} />
    : <SessionList onJoin={setSessionId} />
}
