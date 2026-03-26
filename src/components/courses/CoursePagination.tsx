import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CoursePaginationProps {
  page: number
  totalPages: number
  pageSize: number
  totalItems: number
  onPageChange: (page: number) => void
}

function pageWindow(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages: (number | 'ellipsis')[] = [1]

  if (current > 3) pages.push('ellipsis')

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  for (let i = start; i <= end; i++) pages.push(i)

  if (current < total - 2) pages.push('ellipsis')

  pages.push(total)
  return pages
}

export function CoursePagination({
  page,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
}: CoursePaginationProps) {
  if (totalPages <= 1) return null

  const from = (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, totalItems)

  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
      <p className="text-muted-foreground text-sm">
        Showing {from}–{to} of {totalItems}
      </p>

      <nav className="flex items-center gap-1" aria-label="Pagination">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          aria-label="Previous page"
        >
          <ChevronLeft className="size-4" />
          <span className="hidden sm:inline">Previous</span>
        </Button>

        {pageWindow(page, totalPages).map((entry, i) =>
          entry === 'ellipsis' ? (
            <span
              key={`ellipsis-${i}`}
              className="flex size-8 items-center justify-center text-muted-foreground"
              aria-hidden
            >
              <MoreHorizontal className="size-4" />
            </span>
          ) : (
            <Button
              key={entry}
              variant={entry === page ? 'default' : 'ghost'}
              size="icon"
              className="size-8 text-sm"
              onClick={() => onPageChange(entry)}
              aria-label={`Page ${entry}`}
              aria-current={entry === page ? 'page' : undefined}
            >
              {entry}
            </Button>
          ),
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          aria-label="Next page"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="size-4" />
        </Button>
      </nav>
    </div>
  )
}