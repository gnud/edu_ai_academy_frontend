import { useApiCourseGrid } from '@/hooks/useApiCourseGrid'
import { CourseGridView } from '@/components/courses/CourseGridView'

interface SearchPageProps {
  query: string
}

export function SearchPage({ query }: SearchPageProps) {
  const grid = useApiCourseGrid('catalog', query)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Search Results</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {query
            ? <>Showing results for <span className="font-medium text-foreground">&ldquo;{query}&rdquo;</span></>
            : 'Browse all available courses.'}
        </p>
      </div>

      {grid.error && (
        <p className="text-sm text-red-600">{grid.error}</p>
      )}

      <CourseGridView {...grid} />
    </div>
  )
}