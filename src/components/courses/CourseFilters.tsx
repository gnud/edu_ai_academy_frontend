import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import type { CourseStatus, AudienceType } from '@/data/courses'

export interface CourseFilterState {
  search: string
  status: CourseStatus | 'all'
  audienceType: AudienceType | 'all'
  sortBy: 'title' | 'date' | 'progress' | 'students'
}

export const DEFAULT_FILTERS: CourseFilterState = {
  search: '',
  status: 'all',
  audienceType: 'all',
  sortBy: 'date',
}

interface CourseFiltersProps {
  filters: CourseFilterState
  total: number
  filtered: number
  onChange: (filters: CourseFilterState) => void
}

export function CourseFilters({ filters, total, filtered, onChange }: CourseFiltersProps) {
  const isFiltered =
    filters.search !== '' ||
    filters.status !== 'all' ||
    filters.audienceType !== 'all'

  function set<K extends keyof CourseFilterState>(key: K, value: CourseFilterState[K]) {
    onChange({ ...filters, [key]: value })
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="relative flex-1" style={{ minWidth: '200px' }}>
          <Search className="text-muted-foreground absolute left-2.5 top-2.5 size-4" />
          <Input
            placeholder="Search courses..."
            value={filters.search}
            onChange={(e) => set('search', e.target.value)}
            className="pl-8"
          />
        </div>

        {/* Status filter */}
        <Select value={filters.status} onValueChange={(v) => set('status', v as CourseFilterState['status'])}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        {/* Audience filter */}
        <Select value={filters.audienceType} onValueChange={(v) => set('audienceType', v as CourseFilterState['audienceType'])}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Audience" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All audiences</SelectItem>
            <SelectItem value="students">Students</SelectItem>
            <SelectItem value="teachers">Teachers</SelectItem>
            <SelectItem value="mixed">Mixed</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select value={filters.sortBy} onValueChange={(v) => set('sortBy', v as CourseFilterState['sortBy'])}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Sort: Date</SelectItem>
            <SelectItem value="title">Sort: Title</SelectItem>
            <SelectItem value="progress">Sort: Progress</SelectItem>
            <SelectItem value="students">Sort: Students</SelectItem>
          </SelectContent>
        </Select>

        {/* Clear */}
        {isFiltered && (
          <Button variant="ghost" size="sm" onClick={() => onChange(DEFAULT_FILTERS)}>
            <X className="mr-1 size-3.5" />
            Clear
          </Button>
        )}
      </div>

      <p className="text-muted-foreground text-sm">
        {isFiltered
          ? `Showing ${filtered} of ${total} courses`
          : `${total} courses`}
      </p>
    </div>
  )
}