import { useMemo, useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { motion, useReducedMotion } from 'motion/react'
import type {LinkerStrategy} from '@/utils/foldLogic';
import { foldProteinQueryOptions } from '@/lib/queryClient'
import {
  LINKER_CONFIGS,
  
  createLoveSequence,
  isCreateLoveSequenceError
} from '@/utils/foldLogic'
import { useFoldProtein } from '@/hooks/useFoldProtein'
import { ProteinViewer } from '@/components/ProteinViewer'
import { StrategySelector } from '@/components/StrategySelector'
import { Navigation } from '@/components/landing/Navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export const Route = createFileRoute('/fold/$names')({
  loader: async ({ context, params }) => {
    const { queryClient } = context
    const [name1, name2] = params.names.split('-')

    const result = createLoveSequence(name1 || '', name2 || '')

    if (isCreateLoveSequenceError(result)) {
      return {
        name1: name1 || '',
        name2: name2 || '',
        sequence: '',
        error: result.error,
      }
    }

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

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const },
  },
}

const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.6, ease: 'easeOut' as const, delay: 0.2 },
  },
}

const staticVariants = {
  hidden: { opacity: 1 },
  visible: { opacity: 1 },
}

function FoldRoute() {
  const { name1, name2, error: sequenceError } = Route.useLoaderData()
  const shouldReduceMotion = useReducedMotion()

  const textVariants = shouldReduceMotion ? staticVariants : fadeInUp
  const contentVariants = shouldReduceMotion ? staticVariants : fadeIn

  const formatName = (name: string) => {
    if (!name) return ''
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
  }

  const [selectedStrategy, setSelectedStrategy] = useState<LinkerStrategy>('anchor')
  const [showStrategyPanel, setShowStrategyPanel] = useState(false)

  const sequenceResult = useMemo(() => {
    return createLoveSequence(name1, name2, { strategy: selectedStrategy })
  }, [name1, name2, selectedStrategy])

  const sequence = isCreateLoveSequenceError(sequenceResult) ? undefined : sequenceResult.sequence
  const strategyError = isCreateLoveSequenceError(sequenceResult) ? sequenceResult.error : null

  const { data, isLoading, isPending, isError, error } = useFoldProtein(sequence)

  const currentStrategyConfig = LINKER_CONFIGS[selectedStrategy]
  const hasError = sequenceError || strategyError || isError

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Static gradient background - GPU friendly */}
      <div 
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-pink-100/60 via-rose-50/40 to-purple-100/50 dark:from-pink-950/30 dark:via-rose-950/20 dark:to-purple-950/30" 
      />

      {/* Subtle overlay for better contrast */}
      <div className="pointer-events-none absolute inset-0 bg-background/30 dark:bg-background/50" />

      <Navigation />

      <main className="relative z-10">
        {hasError ? (
          <ErrorState
            error={sequenceError || strategyError || error?.message}
            textVariants={textVariants}
          />
        ) : (
          <>
            {/* Hero header with names */}
            <motion.header
              className="px-4 pt-6 text-center md:px-6 md:pt-8"
              initial="hidden"
              animate="visible"
              variants={textVariants}
            >
              <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
                <span className="text-primary">{formatName(name1)}</span>
                <span className="mx-3 text-pink-400">♥</span>
                <span className="text-primary">{formatName(name2)}</span>
              </h1>
              <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                Your names, bonded at the molecular level
              </p>
            </motion.header>

            {/* Main protein viewer - the hero */}
            <motion.div
              className="relative mx-auto mt-4 max-w-5xl px-4 md:mt-6 md:px-6"
              initial="hidden"
              animate="visible"
              variants={contentVariants}
            >
              <ProteinViewer
                pdbData={data?.pdb}
                isLoading={isPending || isLoading}
                name1={name1}
                name2={name2}
                className="min-h-[450px] sm:min-h-[500px] md:min-h-[550px] lg:min-h-[600px]"
              />
            </motion.div>

            {/* Info badges and controls */}
            <motion.div
              className="mx-auto mt-4 max-w-5xl px-4 md:px-6"
              initial="hidden"
              animate="visible"
              variants={contentVariants}
            >
              {/* Sequence and strategy info */}
              <div className="flex flex-wrap items-center justify-center gap-2">
                {sequence && (
                  <Badge
                    variant="secondary"
                    className="max-w-[200px] truncate font-mono text-xs sm:max-w-none"
                  >
                    {sequence}
                  </Badge>
                )}
                {data && (
                  <>
                    <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                      {currentStrategyConfig.displayName}
                    </Badge>
                    <Badge className="bg-chart-3/10 text-chart-3 hover:bg-chart-3/20">
                      PDB Format
                    </Badge>
                  </>
                )}
              </div>

              {/* Interaction hint */}
              <p className="mt-3 text-center text-sm text-muted-foreground">
                🔬 Drag to rotate&nbsp; •&nbsp; Scroll to zoom&nbsp; •&nbsp; Pinch on mobile
              </p>

              {/* Strategy toggle button */}
              <div className="mt-4 flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowStrategyPanel(!showStrategyPanel)}
                  className="border-primary/20 text-primary hover:bg-primary/5"
                >
                  {showStrategyPanel ? 'Hide' : 'Change'} Folding Strategy
                </Button>
              </div>

              {/* Collapsible strategy selector */}
              {showStrategyPanel && (
                <motion.div
                  className="mt-4 rounded-xl border border-border/50 bg-card/80 p-4 backdrop-blur-sm"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <StrategySelector
                    selectedStrategy={selectedStrategy}
                    onStrategyChange={setSelectedStrategy}
                  />
                </motion.div>
              )}
            </motion.div>

            {/* Footer */}
            <motion.footer
              className="mt-8 pb-8 text-center"
              initial="hidden"
              animate="visible"
              variants={contentVariants}
            >
              <p className="text-sm text-muted-foreground">
                Made with 💕 and science
              </p>
              <div className="mt-3 flex justify-center gap-4">
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/create">Create Another</Link>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/">Home</Link>
                </Button>
              </div>
            </motion.footer>
          </>
        )}
      </main>
    </div>
  )
}

// Error state component
interface ErrorStateProps {
  error: string | null | undefined
  textVariants: typeof fadeInUp | typeof staticVariants
}

function ErrorState({ error, textVariants }: ErrorStateProps) {
  return (
    <motion.div
      className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center"
      initial="hidden"
      animate="visible"
      variants={textVariants}
    >
      {/* Broken heart icon */}
      <div className="relative mb-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          className="text-destructive"
        >
          <path
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09V21.35z"
            fill="currentColor"
            transform="translate(-1, 0)"
          />
          <path
            d="M12 21.35V5.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            fill="currentColor"
            transform="translate(1, 0)"
            opacity="0.6"
          />
        </svg>
      </div>

      <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
        Oops! Something went wrong
      </h2>
      <p className="mt-2 max-w-md text-muted-foreground">
        {error || "We couldn't fold your love protein. Please try again."}
      </p>

      <div className="mt-6 flex gap-3">
        <Button variant="outline" onClick={() => window.history.back()}>
          Go Back
        </Button>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    </motion.div>
  )
}
