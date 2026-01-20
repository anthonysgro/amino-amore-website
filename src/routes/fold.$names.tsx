import { createFileRoute } from '@tanstack/react-router'
import { foldProteinQueryOptions } from '@/lib/queryClient'
import { createLoveSequence } from '@/utils/foldLogic'
import { useFoldProtein } from '@/hooks/useFoldProtein'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'

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
    <div className="min-h-screen bg-linear-to-br from-pink-50 via-rose-50 to-purple-100 p-4 md:p-8">
      <div className="mx-auto max-w-3xl">
        {/* Header Section */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold tracking-tight text-pink-600 md:text-5xl">
            💕 Love Protein 💕
          </h1>
          <p className="text-muted-foreground">
            A unique molecular bond, just for you two
          </p>
        </div>

        {/* Names Card */}
        <Card className="mb-6 border-pink-200/50 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-2 text-center">
            <CardTitle className="text-2xl text-purple-700">
              <span className="capitalize">{name1}</span>
              <span className="mx-3 text-pink-500">❤️</span>
              <span className="capitalize">{name2}</span>
            </CardTitle>
            <CardDescription>Your names, bonded at the molecular level</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Badge variant="secondary" className="font-mono text-xs">
                {sequence}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Separator className="my-6 bg-pink-200/50" />

        {/* Results Section */}
        {isPending || isLoading ? (
          <Card className="border-pink-200/50 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-purple-700">Folding Your Love Protein...</CardTitle>
              <CardDescription>
                Our bio-architects are crafting your unique molecular bond
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="h-16 w-16 animate-spin rounded-full border-4 border-pink-200 border-t-pink-500" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg">💗</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="mx-auto h-4 w-3/4 bg-pink-100" />
                <Skeleton className="mx-auto h-4 w-1/2 bg-pink-100" />
                <Skeleton className="mx-auto h-4 w-2/3 bg-pink-100" />
              </div>
            </CardContent>
          </Card>
        ) : isError ? (
          <Card className="border-red-200 bg-red-50/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-red-600">Oops! Something went wrong</CardTitle>
              <CardDescription className="text-red-500">
                {error?.message || 'We couldn\'t fold your love protein'}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="border-red-200 text-red-600 hover:bg-red-100"
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        ) : data ? (
          <Card className="border-pink-200/50 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-purple-700">
                ✨ Your Unique Love Protein Structure ✨
              </CardTitle>
              <CardDescription>
                This PDB data represents your one-of-a-kind molecular bond
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl bg-linear-to-br from-gray-50 to-gray-100 p-4">
                <pre className="max-h-80 overflow-auto font-mono text-xs text-gray-700">
                  {data.pdb.slice(0, 2000)}
                  {data.pdb.length > 2000 && '\n... (truncated for display)'}
                </pre>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                <Badge className="bg-pink-100 text-pink-700 hover:bg-pink-200">
                  {data.pdb.split('\n').length} lines
                </Badge>
                <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200">
                  PDB Format
                </Badge>
              </div>
              <p className="text-center text-sm text-muted-foreground">
                🔬 This structure can be visualized in any 3D molecular viewer
              </p>
            </CardContent>
          </Card>
        ) : null}

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Made with 💕 and science
          </p>
        </div>
      </div>
    </div>
  )
}
