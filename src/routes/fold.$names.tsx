import { createFileRoute } from '@tanstack/react-router'
import { foldProteinQueryOptions } from '@/lib/queryClient'
import { createLoveSequence } from '@/utils/foldLogic'
import { useFoldProtein } from '@/hooks/useFoldProtein'

export const Route = createFileRoute('/fold/$names')({
  loader: async ({ context, params }) => {
    const { queryClient } = context
    const [name1, name2] = params.names.split('-')

    // Generate the love sequence from the two names
    const sequence = createLoveSequence(name1 || '', name2 || '')

    // prefetchQuery runs on SERVER during SSR - populates cache before hydration
    await queryClient.prefetchQuery(foldProteinQueryOptions(sequence))

    return { name1: name1 || '', name2: name2 || '', sequence }
  },
  component: FoldRoute,
})

function FoldRoute() {
  const { name1, name2, sequence } = Route.useLoaderData()
  const { data, isLoading, isPending, isError, error } =
    useFoldProtein(sequence)

  return (
    <div className="min-h-screen bg-linear-to-br from-pink-50 to-purple-100 p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-center text-4xl font-bold text-pink-600">
          💕 Love Protein 💕
        </h1>

        <div className="mb-8 text-center">
          <p className="text-xl text-purple-700">
            <span className="font-semibold">{name1}</span>
            <span className="mx-2 text-pink-500">❤️</span>
            <span className="font-semibold">{name2}</span>
          </p>
          <p className="mt-2 font-mono text-sm text-gray-500">
            Sequence: {sequence}
          </p>
        </div>

        {isPending || isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-pink-300 border-t-pink-600" />
            <p className="mt-4 text-purple-600">Folding your love protein...</p>
          </div>
        ) : isError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-red-600">
              {error?.message || 'Something went wrong while folding'}
            </p>
          </div>
        ) : data ? (
          <div className="rounded-lg border border-pink-200 bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-semibold text-purple-700">
              Your Unique Love Protein Structure
            </h2>
            <div className="rounded bg-gray-50 p-4">
              <pre className="max-h-96 overflow-auto font-mono text-xs text-gray-700">
                {data.pdb.slice(0, 2000)}
                {data.pdb.length > 2000 && '\n... (truncated for display)'}
              </pre>
            </div>
            <p className="mt-4 text-sm text-gray-500">
              This PDB data can be visualized in a 3D molecular viewer.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  )
}
