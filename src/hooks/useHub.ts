import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { HubData } from '@/lib/hubApi'

interface UseHubResult {
  data: HubData | null
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useHub(): UseHubResult {
  const [data, setData]       = useState<HubData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)
  const [tick, setTick]       = useState(0)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)

    api.get<HubData>('/hub/')
      .then((res) => { if (!cancelled) setData(res) })
      .catch((err) => {
        if (!cancelled) setError(`Failed to load dashboard (${err?.status ?? 'network error'})`)
      })
      .finally(() => { if (!cancelled) setIsLoading(false) })

    return () => { cancelled = true }
  }, [tick])

  return { data, isLoading, error, refetch: () => setTick((t) => t + 1) }
}