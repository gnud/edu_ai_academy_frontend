import { useEffect, useRef, useState } from 'react'
import { Search, Users, X } from 'lucide-react'
import { api } from '@/lib/api'
import { mapCatalogItem, type ApiCourseCatalogItem, type ApiPage } from '@/lib/courseApi'
import type { Course } from '@/data/courses'
import { cn } from '@/lib/utils'

const STATUS_BADGE: Record<Course['status'], string> = {
  active:    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  completed: 'bg-muted text-muted-foreground',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
}

interface SearchAutocompleteProps {
  onSearch: (query: string) => void
}

export function SearchAutocomplete({ onSearch }: SearchAutocompleteProps) {
  const [query,     setQuery]     = useState('')
  const [results,   setResults]   = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen,    setIsOpen]    = useState(false)
  const [highlight, setHighlight] = useState(-1)

  const wrapperRef  = useRef<HTMLDivElement>(null)
  const inputRef    = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortRef    = useRef<AbortController | null>(null)

  // ── Debounced fetch ──────────────────────────────────────────────────────
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    const trimmed = query.trim()
    if (!trimmed) {
      setResults([])
      setIsOpen(false)
      return
    }

    debounceRef.current = setTimeout(() => {
      abortRef.current?.abort()
      const ctrl = new AbortController()
      abortRef.current = ctrl

      setIsLoading(true)
      api
        .get<ApiPage<ApiCourseCatalogItem>>(
          `/courses/?q=${encodeURIComponent(trimmed)}&page_size=10`,
          { signal: ctrl.signal },
        )
        .then((data) => {
          setResults(data.results.map(mapCatalogItem))
          setIsOpen(true)
          setHighlight(-1)
        })
        .catch((err) => {
          if ((err as { name?: string }).name !== 'AbortError') setResults([])
        })
        .finally(() => setIsLoading(false))
    }, 300)

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query])

  // ── Click outside to close ───────────────────────────────────────────────
  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [])

  // ── Keyboard navigation ──────────────────────────────────────────────────
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!isOpen) return
    const total = results.length + 1 // +1 for "show all" row

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlight((h) => (h + 1) % total)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlight((h) => (h - 1 + total) % total)
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      inputRef.current?.blur()
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (highlight >= 0 && highlight < results.length) {
        submitSearch(results[highlight].title)
      } else {
        submitSearch(query)
      }
    }
  }

  function submitSearch(q: string) {
    setIsOpen(false)
    setQuery(q)
    onSearch(q)
  }

  function clear() {
    setQuery('')
    setResults([])
    setIsOpen(false)
    inputRef.current?.focus()
  }

  const showDropdown = isOpen && query.trim().length > 0

  return (
    <div ref={wrapperRef} className="relative hidden sm:block">
      {/* ── Input ─────────────────────────────────────────────────────── */}
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground pointer-events-none" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (results.length > 0) setIsOpen(true) }}
          placeholder="Search courses…"
          className={cn(
            'h-9 w-56 rounded-md border border-input bg-transparent pl-8 pr-8 text-sm',
            'shadow-sm transition-colors placeholder:text-muted-foreground',
            'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
            showDropdown && 'rounded-b-none border-b-0',
          )}
        />
        {query && (
          <button
            onClick={clear}
            className="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground"
            tabIndex={-1}
          >
            <X className="size-4" />
          </button>
        )}
        {isLoading && (
          <span className="absolute right-8 top-2.5 size-4 animate-spin rounded-full border-2 border-muted border-t-primary" />
        )}
      </div>

      {/* ── Dropdown ─────────────────────────────────────────────────── */}
      {showDropdown && (
        <div className="absolute left-0 right-0 z-50 rounded-b-md border border-t-0 border-input bg-popover shadow-lg overflow-hidden">
          {results.length === 0 && !isLoading ? (
            <p className="px-4 py-3 text-sm text-muted-foreground">No courses found.</p>
          ) : (
            <ul>
              {results.map((course, i) => (
                <li key={course.id}>
                  <button
                    onPointerDown={(e) => e.preventDefault()}
                    onClick={() => submitSearch(course.title)}
                    className={cn(
                      'flex w-full items-center gap-3 px-3 py-2 text-left transition-colors',
                      highlight === i
                        ? 'bg-accent text-accent-foreground'
                        : 'hover:bg-muted',
                    )}
                  >
                    {/* Thumbnail */}
                    <img
                      src={course.thumbnail}
                      alt=""
                      className="size-10 shrink-0 rounded-md object-cover"
                      loading="lazy"
                    />

                    {/* Details */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium leading-tight">
                        {course.title}
                      </p>
                      <div className="mt-0.5 flex items-center gap-2">
                        <span className={cn(
                          'rounded-full px-1.5 py-px text-[10px] font-medium capitalize',
                          STATUS_BADGE[course.status],
                        )}>
                          {course.status}
                        </span>
                        {course.enrolledStudents > 0 && (
                          <span className="flex items-center gap-0.5 text-[11px] text-muted-foreground">
                            <Users className="size-3" />
                            {course.enrolledStudents}
                          </span>
                        )}
                        {course.maxStudents && (
                          <span className="text-[11px] text-muted-foreground">
                            max {course.maxStudents}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* Show all footer */}
          <button
            onPointerDown={(e) => e.preventDefault()}
            onClick={() => submitSearch(query)}
            className={cn(
              'flex w-full items-center justify-center gap-1.5 border-t px-4 py-2.5',
              'text-sm font-medium text-primary transition-colors hover:bg-muted',
              highlight === results.length && 'bg-accent text-accent-foreground',
            )}
          >
            <Search className="size-3.5" />
            Show all results for &ldquo;{query}&rdquo;
          </button>
        </div>
      )}
    </div>
  )
}