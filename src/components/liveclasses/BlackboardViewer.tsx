import { useEffect, useRef } from 'react'
import type { ApiBlackboardFile, ApiBlackboardState } from '@/lib/liveClassApi'

interface BlackboardViewerProps {
  file: ApiBlackboardFile
  state: ApiBlackboardState
  isProfessor: boolean
  onMediaEnded?: () => void
}

export function BlackboardViewer({ file, state, isProfessor, onMediaEnded }: BlackboardViewerProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const videoRef  = useRef<HTMLVideoElement>(null)
  const audioRef  = useRef<HTMLAudioElement>(null)

  // Sync scroll position from state (broadcast to all).
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = state.scroll_y
    }
  }, [state.scroll_y])

  // Sync play/pause for video and audio — applies to everyone including professor.
  useEffect(() => {
    if (videoRef.current) {
      state.media_playing ? videoRef.current.play().catch(() => {}) : videoRef.current.pause()
    }
    if (audioRef.current) {
      state.media_playing ? audioRef.current.play().catch(() => {}) : audioRef.current.pause()
    }
  }, [state.media_playing])

  // Rotation: swap width/height when rotated 90° or 270° so the content fills the container.
  const needsSwap    = state.rotation === 90 || state.rotation === 270
  const scalePercent = state.zoom / 100

  // We wrap the rotatable content in a fixed-size square (min of viewport dims or
  // explicit sizing), then apply the rotate + scale on the inner element.
  // Using transform-origin: center center prevents the "shift half-height" bug.
  const innerStyle: React.CSSProperties = {
    transform: `rotate(${state.rotation}deg) scale(${scalePercent})`,
    transformOrigin: 'center center',
    transition: 'transform 0.25s ease',
    // When rotated 90/270, exchange reported width/height so the image fills horizontally.
    width:  needsSwap ? '100%' : undefined,
    height: needsSwap ? 'auto' : undefined,
    maxWidth: '100%',
  }

  function renderContent() {
    switch (file.file_type) {
      case 'image':
        return (
          <div className="flex flex-1 items-center justify-center overflow-hidden">
            <img
              src={file.url}
              alt={file.name}
              className="object-contain"
              style={innerStyle}
            />
          </div>
        )

      case 'video':
        return (
          <div className="flex flex-1 items-center justify-center bg-black overflow-hidden">
            <video
              ref={videoRef}
              src={file.url}
              className="max-h-full max-w-full"
              style={{ transform: `scale(${scalePercent})`, transformOrigin: 'center center', transition: 'transform 0.25s ease' }}
              onEnded={onMediaEnded}
              // No native controls — toolbar is the sole controller
            />
          </div>
        )

      case 'audio':
        return (
          <div className="flex flex-1 flex-col items-center justify-center gap-4">
            <div className="flex size-24 items-center justify-center rounded-full bg-primary/20 text-5xl select-none">♪</div>
            <p className="text-sm font-semibold text-zinc-300">{file.name}</p>
            <audio
              ref={audioRef}
              src={file.url}
              onEnded={onMediaEnded}
              // No native controls — toolbar Play/Pause controls playback
            />
            <p className="text-xs text-zinc-500">
              {state.media_playing ? '▶ Playing…' : '⏸ Paused'}
            </p>
            {isProfessor && (
              <p className="text-[10px] text-zinc-600">Use the Play/Pause button in the toolbar.</p>
            )}
          </div>
        )

      case 'pdf':
        return (
          <iframe
            src={file.url}
            title={file.name}
            className="flex-1 w-full border-0"
            style={innerStyle}
          />
        )

      case 'text':
      case 'markdown':
        return (
          <iframe
            src={file.url}
            title={file.name}
            className="flex-1 w-full border-0 bg-white"
            style={innerStyle}
          />
        )

      default:
        return (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-zinc-500">Unsupported file type: {file.file_type}</p>
          </div>
        )
    }
  }

  return (
    <div ref={scrollRef} className="flex flex-1 flex-col overflow-auto bg-zinc-900 p-4">
      {renderContent()}
    </div>
  )
}
