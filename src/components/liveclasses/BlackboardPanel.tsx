import { useState, useEffect, useRef, useCallback } from 'react'
import { X, RadioTower } from 'lucide-react'
import { useBlackboard } from '@/hooks/useBlackboard'
import { FileManager } from './FileManager'
import { BlackboardViewer } from './BlackboardViewer'
import { BlackboardToolbar } from './BlackboardToolbar'
import type { ApiBlackboardFile } from '@/lib/liveClassApi'

interface BlackboardPanelProps {
  sessionId: number
  isProfessor: boolean
  onClose: () => void
}

export function BlackboardPanel({ sessionId, isProfessor, onClose }: BlackboardPanelProps) {
  const { state, files, sendCommand, uploadFile, deleteFile } = useBlackboard(sessionId)
  const containerRef = useRef<HTMLDivElement>(null)

  // Professor-only local preview — never sent to backend until Broadcast is clicked.
  const [previewFile, setPreviewFile] = useState<ApiBlackboardFile | null>(null)

  // The file shown in the viewer:
  //   professor → only what they explicitly selected locally (previewFile); always blank on fresh open
  //   students  → active_file only while is_live; placeholder otherwise
  const viewerFile = isProfessor
    ? previewFile
    : (state.is_live ? state.active_file : null)

  // Enter / exit fullscreen for everyone when state.is_fullscreen changes.
  useEffect(() => {
    if (!containerRef.current) return
    if (state.is_fullscreen && !document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch(() => {})
    } else if (!state.is_fullscreen && document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => {})
    }
  }, [state.is_fullscreen])

  // Students: re-enter fullscreen if they try to escape while professor has it active.
  const onFullscreenChange = useCallback(() => {
    if (!isProfessor && state.is_fullscreen && !document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.().catch(() => {})
    }
  }, [isProfessor, state.is_fullscreen])

  useEffect(() => {
    document.addEventListener('fullscreenchange', onFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange)
  }, [onFullscreenChange])

  // Call requestFullscreen directly from a user-gesture handler so the browser allows it.
  async function handleToggleFullscreen() {
    const next = !state.is_fullscreen
    await sendCommand({ is_fullscreen: next })
    if (next && !document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.().catch(() => {})
    } else if (!next && document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => {})
      await sendCommand({ is_live: false, active_file_id: null })
      setPreviewFile(null)
    }
  }

  // Selecting a file just updates the local preview — students see nothing yet.
  function handleSelectFile(file: ApiBlackboardFile) {
    setPreviewFile(file)
  }

  // Broadcast: push the currently previewed file to all participants.
  async function handleBroadcast() {
    const target = previewFile ?? state.active_file
    if (!target) return
    await sendCommand({ active_file_id: target.id, is_live: true, scroll_y: 0, zoom: 100, rotation: 0 })
  }

  // Stop broadcast: clear is_live + active_file and reset local preview selection.
  async function handleStopBroadcast() {
    await sendCommand({ is_live: false, active_file_id: null })
    setPreviewFile(null)
  }

  async function handleUpload(file: File) {
    const bf = await uploadFile(file)
    if (bf) setPreviewFile(bf)
  }

  const isStudentFullscreen = !isProfessor && state.is_fullscreen

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col bg-zinc-900 text-white"
    >
      {isProfessor && (
        <BlackboardToolbar
          state={state}
          previewFile={previewFile}
          onCommand={sendCommand}
          onToggleFullscreen={handleToggleFullscreen}
          onBroadcast={handleBroadcast}
          onStopBroadcast={handleStopBroadcast}
        />
      )}

      {isStudentFullscreen && (
        <div className="flex items-center justify-center gap-2 bg-red-900/60 px-4 py-1 text-xs text-red-200">
          <span className="size-1.5 rounded-full bg-red-400 animate-pulse inline-block" />
          Live session — fullscreen required
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {isProfessor && (
          <FileManager
            files={files}
            previewFileId={previewFile?.id ?? null}
            broadcastFileId={state.active_file?.id ?? null}
            isLive={state.is_live}
            isProfessor={isProfessor}
            onSelect={handleSelectFile}
            onUpload={handleUpload}
            onDelete={deleteFile}
          />
        )}

        <div className="flex flex-1 flex-col overflow-hidden">
          {viewerFile ? (
            <BlackboardViewer
              file={viewerFile}
              state={state}
              isProfessor={isProfessor}
              onMediaEnded={() => isProfessor && sendCommand({ media_playing: false })}
            />
          ) : isProfessor ? (
            <div className="flex flex-1 items-center justify-center">
              <p className="text-zinc-500">Select a file to preview, then click Broadcast.</p>
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-6 bg-zinc-950">
              <div className="flex flex-col items-center gap-4">
                <div className="relative flex size-28 items-center justify-center rounded-2xl bg-zinc-800 shadow-lg">
                  <RadioTower className="size-14 text-zinc-600" />
                  <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-zinc-700">
                    <span className="size-2 rounded-full bg-zinc-500" />
                  </span>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-zinc-400">No broadcast active</p>
                  <p className="mt-1 text-sm text-zinc-600">Nothing is being emitted at the moment.</p>
                  <p className="mt-0.5 text-xs text-zinc-700">Waiting for the professor to start broadcasting…</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {isProfessor && (
        <button
          onClick={async () => {
            await sendCommand({ is_live: false, active_file_id: null })
            onClose()
          }}
          className="absolute right-4 top-1 text-zinc-400 hover:text-white"
          title="Close blackboard"
        >
          <X className="size-5" />
        </button>
      )}
    </div>
  )
}
