import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import type { ApiBlackboardFile, ApiBlackboardState } from '@/lib/liveClassApi'

const POLL_MS = 3000

const DEFAULT_STATE: ApiBlackboardState = {
  active_file:   null,
  is_fullscreen: false,
  is_live:       false,
  scroll_y:      0,
  zoom:          100,
  rotation:      0,
  media_playing: false,
}

export function useBlackboard(sessionId: number) {
  const [state, setState]   = useState<ApiBlackboardState>(DEFAULT_STATE)
  const [files, setFiles]   = useState<ApiBlackboardFile[]>([])

  const fetchState = useCallback(async () => {
    try {
      const s = await api.get<ApiBlackboardState>(`/classes/${sessionId}/blackboard/`)
      setState(s)
    } catch { /* ignore */ }
  }, [sessionId])

  const fetchFiles = useCallback(async () => {
    try {
      const f = await api.get<ApiBlackboardFile[]>(`/classes/${sessionId}/blackboard/files/`)
      setFiles(f)
    } catch { /* ignore */ }
  }, [sessionId])

  useEffect(() => {
    fetchState()
    fetchFiles()
    const interval = setInterval(fetchState, POLL_MS)
    return () => clearInterval(interval)
  }, [fetchState, fetchFiles])

  const sendCommand = useCallback(async (patch: Record<string, unknown>) => {
    try {
      const s = await api.patch<ApiBlackboardState>(`/classes/${sessionId}/blackboard/`, patch)
      setState(s)
    } catch { /* ignore */ }
  }, [sessionId])

  const uploadFile = useCallback(async (file: File, name?: string): Promise<ApiBlackboardFile | null> => {
    const form = new FormData()
    form.append('file', file)
    form.append('name', name ?? file.name)
    try {
      const bf = await api.postForm<ApiBlackboardFile>(`/classes/${sessionId}/blackboard/files/`, form)
      setFiles((prev) => [bf, ...prev])
      return bf
    } catch {
      return null
    }
  }, [sessionId])

  const deleteFile = useCallback(async (fileId: number) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId))
    try {
      await api.delete(`/classes/${sessionId}/blackboard/files/${fileId}/`)
    } catch {
      fetchFiles()
    }
  }, [sessionId, fetchFiles])

  return { state, files, sendCommand, uploadFile, deleteFile }
}
