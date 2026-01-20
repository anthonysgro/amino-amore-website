import { QueryClient, queryOptions } from '@tanstack/react-query'
import { foldProteinFn } from '@/api/foldProtein'

/**
 * Creates a new QueryClient instance with default options optimized for
 * protein folding data - which is stable and doesn't change frequently.
 */
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 60, // 1 hour - proteins don't change
        gcTime: 1000 * 60 * 60 * 24, // 24 hours cache retention
        retry: 2,
        refetchOnWindowFocus: false,
      },
    },
  })
}

/**
 * Query key factory for type-safe, consistent cache keys
 */
export const foldProteinKeys = {
  all: ['foldProtein'] as const,
  sequence: (sequence: string) => ['foldProtein', sequence] as const,
}

/**
 * Query options factory for reuse in route loaders and components.
 * Uses the foldProteinFn server function to call ESMFold API.
 */
export const foldProteinQueryOptions = (sequence: string) =>
  queryOptions({
    queryKey: foldProteinKeys.sequence(sequence),
    queryFn: () => foldProteinFn({ data: sequence }),
    staleTime: 1000 * 60 * 60, // 1 hour
    enabled: !!sequence && sequence.length > 0,
  })
