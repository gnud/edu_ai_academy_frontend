import { useState, useCallback, useEffect } from 'react'
import { api } from '@/lib/api'
import type { ApiGroup } from '@/lib/liveClassApi'

export function useClassroomGroups(sessionId: number | null) {
  const [groups, setGroups] = useState<ApiGroup[]>([])

  const fetchGroups = useCallback(async () => {
    if (!sessionId) return
    try {
      const data = await api.get<ApiGroup[]>(`/classes/${sessionId}/groups/`)
      setGroups(data)
    } catch { /* ignore */ }
  }, [sessionId])

  useEffect(() => {
    fetchGroups()
    const interval = setInterval(fetchGroups, 5000)
    return () => clearInterval(interval)
  }, [fetchGroups])

  const createGroup = useCallback(async (name: string, participantIds: number[]): Promise<ApiGroup> => {
    const group = await api.post<ApiGroup>(`/classes/${sessionId}/groups/`, {
      name,
      participant_ids: participantIds,
    })
    setGroups((prev) => [...prev, group])
    return group
  }, [sessionId])

  const deleteGroup = useCallback(async (groupId: number) => {
    setGroups((prev) => prev.filter((g) => g.id !== groupId))
    try {
      await api.delete(`/classes/${sessionId}/groups/${groupId}/`)
    } catch {
      await fetchGroups()
    }
  }, [sessionId, fetchGroups])

  const setGroupingActive = useCallback(async (active: boolean) => {
    await api.patch(`/classes/${sessionId}/grouping/`, { grouping_active: active })
  }, [sessionId])

  return { groups, setGroups, fetchGroups, createGroup, deleteGroup, setGroupingActive }
}
