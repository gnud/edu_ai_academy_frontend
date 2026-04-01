import {
  Play, Pause, Radio, RadioTower,
  ZoomIn, ZoomOut, ChevronUp, ChevronDown,
  RotateCw, Monitor, MonitorOff,
} from 'lucide-react'
import type { ApiBlackboardFile, ApiBlackboardState } from '@/lib/liveClassApi'

interface BlackboardToolbarProps {
  state: ApiBlackboardState
  previewFile: ApiBlackboardFile | null   // local professor selection (not yet broadcast)
  onCommand: (patch: Record<string, unknown>) => void
  onToggleFullscreen: () => void
  onBroadcast: () => void
  onStopBroadcast: () => void
}

function Btn({
  onClick, title, children, active, disabled,
}: { onClick: () => void; title: string; children: React.ReactNode; active?: boolean; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={`flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
        active ? 'bg-primary text-primary-foreground' : 'text-zinc-300 hover:bg-zinc-700'
      }`}
    >
      {children}
    </button>
  )
}

const Sep = () => <div className="w-px self-stretch bg-zinc-700 mx-1" />

export function BlackboardToolbar({
  state, previewFile, onCommand, onToggleFullscreen, onBroadcast, onStopBroadcast,
}: BlackboardToolbarProps) {
  // Use the preview file to decide which controls are available.
  const activeFile  = previewFile ?? state.active_file
  const isMedia     = activeFile?.file_type === 'video' || activeFile?.file_type === 'audio'
  const isZoomable  = activeFile && ['image', 'pdf', 'text', 'markdown'].includes(activeFile.file_type)
  const isRotatable = activeFile && ['image', 'pdf'].includes(activeFile.file_type)

  return (
    <div className="flex items-center gap-1 border-b border-zinc-700 bg-zinc-800 px-3 py-1.5 flex-wrap">

      {/* Start / Stop fullscreen for all */}
      <Btn onClick={onToggleFullscreen} title={state.is_fullscreen ? 'Stop fullscreen for all' : 'Start fullscreen for all'} active={state.is_fullscreen}>
        {state.is_fullscreen
          ? <><MonitorOff className="size-3.5" /> Stop</>
          : <><Monitor    className="size-3.5" /> Start</>
        }
      </Btn>

      <Sep />

      {/* Broadcast / Stop Broadcast */}
      {state.is_live ? (
        <Btn onClick={onStopBroadcast} title="Stop broadcasting" active>
          <RadioTower className="size-3.5 animate-pulse" /> Stop Broadcast
        </Btn>
      ) : (
        <Btn
          onClick={onBroadcast}
          title={previewFile ? `Broadcast "${previewFile.name}" to all` : 'Select a file to broadcast'}
          disabled={!previewFile && !state.active_file}
        >
          <Radio className="size-3.5" /> Broadcast
        </Btn>
      )}

      <Sep />

      {/* Scroll */}
      <Btn onClick={() => onCommand({ scroll_y: Math.max(0, state.scroll_y - 200) })} title="Scroll up">
        <ChevronUp className="size-3.5" />
      </Btn>
      <Btn onClick={() => onCommand({ scroll_y: state.scroll_y + 200 })} title="Scroll down">
        <ChevronDown className="size-3.5" />
      </Btn>

      {/* Zoom */}
      {isZoomable && (
        <>
          <Sep />
          <Btn onClick={() => onCommand({ zoom: Math.max(25, state.zoom - 25) })} title="Zoom out">
            <ZoomOut className="size-3.5" />
          </Btn>
          <span className="text-xs text-zinc-400 w-10 text-center">{state.zoom}%</span>
          <Btn onClick={() => onCommand({ zoom: Math.min(400, state.zoom + 25) })} title="Zoom in">
            <ZoomIn className="size-3.5" />
          </Btn>
        </>
      )}

      {/* Rotate */}
      {isRotatable && (
        <>
          <Sep />
          <Btn onClick={() => onCommand({ rotation: (state.rotation + 90) % 360 })} title="Rotate 90°">
            <RotateCw className="size-3.5" /> {state.rotation}°
          </Btn>
        </>
      )}

      {/* Play / Pause */}
      {isMedia && (
        <>
          <Sep />
          <Btn onClick={() => onCommand({ media_playing: !state.media_playing })} title={state.media_playing ? 'Pause' : 'Play'} active={state.media_playing}>
            {state.media_playing
              ? <><Pause className="size-3.5" /> Pause</>
              : <><Play  className="size-3.5" /> Play</>
            }
          </Btn>
        </>
      )}
    </div>
  )
}
