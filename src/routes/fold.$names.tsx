import { useState, useMemo } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { foldProteinQueryOptions } from '@/lib/queryClient'
import {
  createLoveSequence,
  isCreateLoveSequenceError,
  type LinkerStrategy,
  LINKER_CONFIGS,
} from '@/utils/foldLogic'
import { useFoldProtein } from '@/hooks/useFoldProtein'
import { ProteinViewer } from '@/components/ProteinViewer'
import { StrategySelector } from '@/components/StrategySelector'
import { Navigation } from '@/components/landing/Navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/fold/$names')({
  loader: async ({ context, params }) => {
    const { queryClient } = context
    const [name1, name2] = params.names.split('-')

    // Generate the love sequence from the two names with default strategy
    const result = createLoveSequence(name1 || '', name2 || '')

    // Check for errors in sequence generation
    if (isCreateLoveSequenceError(result)) {
      return {
        name1: name1 || '',
        name2: name2 || '',
        sequence: '',
        error: result.error,
      }
    }

    // prefetchQuery runs on SERVER during SSR - populates cache before hydration
    await queryClient.prefetchQuery(foldProteinQueryOptions(result.sequence))

    return {
      name1: name1 || '',
      name2: name2 || '',
      sequence: result.sequence,
      error: null,
    }
  },
  component: FoldRoute,
})

function FoldRoute() {
  const { name1, name2, error: sequenceError } = Route.useLoaderData()
  
  // Strategy state management - default to 'anchor' as per requirements
  const [selectedStrategy, setSelectedStrategy] = useState<LinkerStrategy>('anchor')
  
  // Generate sequence based on selected strategy
  const sequenceResult = useMemo(() => {
    return createLoveSequence(name1, name2, { strategy: selectedStrategy })
  }, [name1, name2, selectedStrategy])
  
  // Extract sequence or error from result
  const sequence = isCreateLoveSequenceError(sequenceResult) ? undefined : sequenceResult.sequence
  const strategyError = isCreateLoveSequenceError(sequenceResult) ? sequenceResult.error : null
  
  const { data, isLoading, isPending, isError, error } =
    useFoldProtein(sequence)

  // Get current strategy config for display
  const currentStrategyConfig = LINKER_CONFIGS[selectedStrategy]

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="bg-linear-to-br from-pink-50 via-rose-50 to-purple-100 dark:from-pink-950/20 dark:via-rose-950/20 dark:to-purple-950/20 p-4 md:p-6">
        <div className="mx-auto max-w-4xl">
          
          {/* Compact Names Header - positioned above the hero */}
          <div className="mb-4 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-pink-600 md:text-3xl lg:text-4xl">
              <span className="capitalize">{name1}</span>
              <span className="mx-2 text-pink-500 md:mx-3">❤️</span>
              <span className="capitalize">{name2}</span>
            </h1>
            {sequence && (
              <Badge variant="secondary" className="mt-2 font-mono text-xs">
                {sequence}
              </Badge>
            )}
          </div>

          {/* HERO SECTION - 3D Protein Viewer */}
          {sequenceError || strategyError ? (
            <Card className="border-red-200 bg-red-50/80 backdrop-blur-sm">
              <CardHeader className="text-center">
                <CardTitle className="text-red-600">Oops! Something went wrong</CardTitle>
                <CardDescription className="text-red-500">
                  {sequenceError || strategyError}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button
                  variant="outline"
                  onClick={() => window.history.back()}
                  className="border-red-200 text-red-600 hover:bg-red-100"
                >
                  Go Back
                </Button>
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
          ) : (
            <Card className="border-pink-200/50 bg-white/80 backdrop-blur-sm shadow-xl">
              <CardContent className="p-3 md:p-4">
                {/* 3D Protein Viewer Component - THE HERO */}
                <ProteinViewer
                  pdbData={data?.pdb}
                  isLoading={isPending || isLoading}
                  name1={name1}
                  name2={name2}
                />
                {data && (
                  <div className="mt-3 flex flex-wrap justify-center gap-2">
                    <Badge className="bg-pink-100 text-pink-700 hover:bg-pink-200">
                      {currentStrategyConfig.displayName}
                    </Badge>
                    <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200">
                      PDB Format
                    </Badge>
                  </div>
                )}
                <p className="mt-2 text-center text-sm text-muted-foreground">
                  🔬 Use your mouse or touch to rotate and zoom the 3D structure
                </p>
              </CardContent>
            </Card>
          )}

          {/* Strategy Selector - positioned BELOW the hero */}
          <Card className="mt-6 border-pink-200/50 bg-white/80 backdrop-blur-sm">
            <CardContent className="pt-6">
              <StrategySelector
                selectedStrategy={selectedStrategy}
                onStrategyChange={setSelectedStrategy}
              />
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Made with 💕 and science
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
