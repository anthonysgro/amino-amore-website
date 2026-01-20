import { useQuery } from '@tanstack/react-query'
import { foldProteinQueryOptions } from '@/lib/queryClient'

/**
 * React hook for fetching protein structures from the ESMFold API.
 *
 * Uses TanStack Query with SSR-compatible query options. The hook automatically
 * handles caching, loading states, and error handling.
 *
 * @param sequence - Amino acid sequence to fold (optional/undefined allowed)
 * @returns Query result with data, loading states, error info, and refetch function
 *
 * @example
 * ```tsx
 * const { data, isLoading, isError, error, refetch } = useFoldProtein('MVLSPADKTNVKAAWGKVGAHAGEYGAEALERMFLSFPTTKTYFPHFDLSH')
 *
 * if (isLoading) return <Spinner />
 * if (isError) return <Error message={error.message} />
 * if (data) return <ProteinViewer pdb={data.pdb} />
 * ```
 */
export function useFoldProtein(sequence: string | undefined) {
  const query = useQuery({
    ...foldProteinQueryOptions(sequence ?? ''),
    enabled: !!sequence && sequence.length > 0,
  })

  return {
    data: query.data,
    isLoading: query.isLoading,
    isPending: query.isPending,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}
