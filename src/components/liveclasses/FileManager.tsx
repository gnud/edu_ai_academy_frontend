import { useRef } from 'react'
import { Trash2, Upload, FileText, FileImage, FileVideo, Music, File } from 'lucide-react'
import type { ApiBlackboardFile } from '@/lib/liveClassApi'

interface FileManagerProps {
  files: ApiBlackboardFile[]
  previewFileId: number | null    // locally selected by professor (preview only)
  broadcastFileId: number | null  // currently broadcast to all (state.active_file)
  isLive: boolean
  isProfessor: boolean
  onSelect: (file: ApiBlackboardFile) => void
  onUpload: (file: File) => void
  onDelete: (fileId: number) => void
}

const TYPE_ICON: Record<string, React.ReactNode> = {
  text:     <FileText  className="size-4 shrink-0 text-zinc-400" />,
  markdown: <FileText  className="size-4 shrink-0 text-blue-400" />,
  pdf:      <File      className="size-4 shrink-0 text-red-400" />,
  image:    <FileImage className="size-4 shrink-0 text-green-400" />,
  video:    <FileVideo className="size-4 shrink-0 text-purple-400" />,
  audio:    <Music     className="size-4 shrink-0 text-yellow-400" />,
}

export function FileManager({
  files, previewFileId, broadcastFileId, isLive,
  isProfessor, onSelect, onUpload, onDelete,
}: FileManagerProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="flex h-full w-52 shrink-0 flex-col border-r border-zinc-700 bg-zinc-800">
      <div className="flex items-center justify-between border-b border-zinc-700 px-3 py-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Files</span>
        {isProfessor && (
          <>
            <button
              onClick={() => inputRef.current?.click()}
              className="flex items-center gap-1 rounded-full bg-primary px-2 py-1 text-[10px] font-semibold text-primary-foreground hover:opacity-90"
            >
              <Upload className="size-3" /> Upload
            </button>
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              accept=".txt,.md,.pdf,image/*,video/*,audio/*"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) { onUpload(f); e.target.value = '' }
              }}
            />
          </>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-2">
        {files.length === 0 && (
          <p className="mt-4 text-center text-xs text-zinc-500">No files uploaded.</p>
        )}
        {files.map((f) => {
          const isPreviewing = f.id === previewFileId
          const isBroadcast  = f.id === broadcastFileId && isLive
          return (
            <div
              key={f.id}
              className={`group flex items-center gap-2 rounded-lg px-2 py-1.5 cursor-pointer transition-colors ${
                isPreviewing ? 'bg-zinc-600 ring-1 ring-zinc-400' : 'hover:bg-zinc-700'
              }`}
              onClick={() => onSelect(f)}
            >
              {TYPE_ICON[f.file_type] ?? <File className="size-4 shrink-0 text-zinc-400" />}
              <span className="flex-1 truncate text-xs text-zinc-200">{f.name}</span>
              {isBroadcast && (
                <span className="flex items-center gap-1 text-[9px] font-bold text-red-400 uppercase shrink-0">
                  <span className="size-1.5 rounded-full bg-red-400 animate-pulse inline-block" />
                  Live
                </span>
              )}
              {isProfessor && !isBroadcast && (
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(f.id) }}
                  className="hidden group-hover:flex text-zinc-500 hover:text-red-400"
                  title="Delete file"
                >
                  <Trash2 className="size-3" />
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
