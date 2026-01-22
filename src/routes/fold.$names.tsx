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
  
  // Helper to properly format names (capitalize first letter)
  const formatName = (name: string) => {
    if (!name) return ''
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
  }
  
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
        <div className="mx-auto max-w-6xl">
          
          {/* Names Card - positioned above the hero */}
          <Card className="mb-4 border-pink-200/50 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-2 pt-4 text-center">
              <CardTitle className="text-2xl text-pink-600 md:text-3xl">
                {formatName(name1)} <span className="text-pink-500">❤️</span> {formatName(name2)}
              </CardTitle>
              <CardDescription>Your names, bonded at the molecular level</CardDescription>
            </CardHeader>
            <CardContent className="pb-4 pt-0">
              <div className="flex justify-center">
                {sequence && (
                  <Badge variant="secondary" className="font-mono text-xs">
                    {sequence}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* HERO SECTION - 3D Protein Viewer (minimal wrapper, just thin border) */}
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
            <div className="space-y-3">
              {/* 3D Protein Viewer - THE HERO - minimal styling, let it breathe */}
              <ProteinViewer
                pdbData={data?.pdb}
                isLoading={isPending || isLoading}
                name1={name1}
                name2={name2}
                className="min-h-[500px] sm:min-h-[550px] md:min-h-[650px] lg:min-h-[700px]"
              />
              {data && (
                <div className="flex flex-wrap justify-center gap-2">
                  <Badge className="bg-pink-100 text-pink-700 hover:bg-pink-200">
                    {currentStrategyConfig.displayName}
                  </Badge>
                  <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200">
                    PDB Format
                  </Badge>
                </div>
              )}
              <p className="text-center text-sm text-muted-foreground">
                🔬 Use your mouse or touch to rotate and zoom the 3D structure
              </p>
            </div>
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
