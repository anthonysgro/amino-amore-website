import { useMemo, useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { motion, useReducedMotion } from 'motion/react'
import type { LinkerStrategy } from '@/utils/foldLogic'
import { foldProteinQueryOptions } from '@/lib/queryClient'
import {
  LINKER_CONFIGS,
  createLoveSequence,
  isCreateLoveSequenceError,
} from '@/utils/foldLogic'
import { getProteinPersonality, parsePdbStats } from '@/utils/pdbStats'
import { useFoldProtein } from '@/hooks/useFoldProtein'
import { ProteinViewer } from '@/components/ProteinViewer'
import { StrategySelector } from '@/components/StrategySelector'
import { Navigation } from '@/components/landing/Navigation'
import { DNAHeartLogo } from '@/components/landing/DNAHeartLogo'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export const Route = createFileRoute('/fold/$names')({
  head: ({ params }) => {
    const names = params.names || ''
    const [name1 = '', name2 = ''] = names.split('-')
    const formatName = (n: string) =>
      n ? n.charAt(0).toUpperCase() + n.slice(1).toLowerCase() : ''
    const title = `${formatName(name1)} 💕 ${formatName(name2)} - Our Love Protein`
    const description = `Someone special created a unique molecular bond from your names! See your Love Protein at folded.love 🧬`

    return {
      meta: [
        { title },
        { name: 'description', content: description },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:image', content: 'https://folded.love/preview.png' },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: description },
      ],
    }
  },
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

  const [selectedStrategy, setSelectedStrategy] =
    useState<LinkerStrategy>('anchor')
  const [showStrategyPanel, setShowStrategyPanel] = useState(false)

  const sequenceResult = useMemo(() => {
    return createLoveSequence(name1, name2, { strategy: selectedStrategy })
  }, [name1, name2, selectedStrategy])

  const sequence = isCreateLoveSequenceError(sequenceResult)
    ? undefined
    : sequenceResult.sequence
  const strategyError = isCreateLoveSequenceError(sequenceResult)
    ? sequenceResult.error
    : null

  const { data, isLoading, isPending, isError, error } =
    useFoldProtein(sequence)

  const currentStrategyConfig = LINKER_CONFIGS[selectedStrategy]
  const hasError = sequenceError || strategyError || isError

  return (
    <div className="relative min-h-screen bg-background">
      {/* Static gradient background - GPU friendly */}
      <div className="pointer-events-none fixed inset-0 bg-gradient-to-br from-pink-100/60 via-rose-50/40 to-purple-100/50 dark:from-pink-950/30 dark:via-rose-950/20 dark:to-purple-950/30" />

      {/* Subtle overlay for better contrast */}
      <div className="pointer-events-none fixed inset-0 bg-background/30 dark:bg-background/50" />

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
              className="px-4 pt-8 text-center md:px-6 md:pt-12"
              initial="hidden"
              animate="visible"
              variants={textVariants}
            >
              {/* Stacked on mobile, inline on larger screens */}
              <h1 className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl lg:text-6xl">
                <span className="text-primary">{formatName(name1)}</span>
                <DNAHeartLogo size={32} className="shrink-0 my-1 sm:my-0" />
                <span className="text-primary">{formatName(name2)}</span>
              </h1>
              <p className="mt-3 text-sm text-muted-foreground sm:text-base">
                Your names, bonded at the molecular level
              </p>
            </motion.header>

            {/* Main protein viewer - the hero */}
            <motion.div
              className="relative mx-auto mt-6 max-w-5xl px-4 md:mt-10 md:px-6"
              initial="hidden"
              animate="visible"
              variants={contentVariants}
            >
              <ProteinViewer
                pdbData={data?.pdb}
                isLoading={isPending || isLoading}
                name1={name1}
                name2={name2}
                sequence={sequence}
                className="min-h-[450px] sm:min-h-[500px] md:min-h-[550px] lg:min-h-[600px]"
              />
            </motion.div>

            {/* Info badges and controls */}
            <motion.div
              className="mx-auto mt-6 max-w-5xl px-4 md:mt-8 md:px-6"
              initial="hidden"
              animate="visible"
              variants={contentVariants}
            >
              {/* Sequence and strategy info */}
              <div className="flex flex-wrap items-center justify-center gap-2">
                {sequence && <SequenceBadge sequence={sequence} />}
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
                🔬 Drag to rotate&nbsp; •&nbsp; Scroll to zoom&nbsp; •&nbsp;
                Pinch on mobile
              </p>

              {/* Strategy toggle button */}
              <div className="mt-4 flex justify-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowStrategyPanel(!showStrategyPanel)}
                  className="border-primary/20 text-primary hover:bg-primary/5"
                >
                  {showStrategyPanel ? 'Hide' : 'Change'} Folding Strategy
                </Button>
                <ShareButton name1={name1} name2={name2} />
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

              {/* Protein Stats */}
              {data?.pdb && sequence && (
                <ProteinStatsCard pdbData={data.pdb} sequence={sequence} />
              )}
            </motion.div>

            {/* Footer */}
            <motion.footer
              className="mt-16 pb-10 text-center"
              initial="hidden"
              animate="visible"
              variants={contentVariants}
            >
              <p className="text-sm text-muted-foreground">
                Made with 💕 and science
              </p>
              <div className="mt-4 flex justify-center gap-4">
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

// Sequence badge with copy button
function SequenceBadge({ sequence }: { sequence: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(sequence)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
    >
      <span className="max-w-[200px] truncate font-mono sm:max-w-none">
        {sequence}
      </span>
      {copied ? (
        <span className="text-primary">Copied!</span>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-60"
        >
          <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
        </svg>
      )}
    </button>
  )
}

// Share button component
function ShareButton({ name1, name2 }: { name1: string; name2: string }) {
  const [shared, setShared] = useState(false)

  const handleShare = async () => {
    const url = window.location.href
    const title = `${name1} 💕 ${name2} - Our Love Protein`
    const text = `Someone special created a unique protein from our names! See our molecular bond at folded.love 🧬💕`

    // Try native share API first (mobile)
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url })
        return
      } catch {
        // User cancelled or share failed, fall back to clipboard
      }
    }

    // Fall back to clipboard
    await navigator.clipboard.writeText(`${text}\n${url}`)
    setShared(true)
    setTimeout(() => setShared(false), 2000)
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleShare}
      className="border-pink-300 text-pink-500 hover:bg-pink-50 dark:border-pink-700 dark:text-pink-400 dark:hover:bg-pink-950"
    >
      {shared ? (
        'Link Copied! 💕'
      ) : (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-1.5"
          >
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" x2="12" y1="2" y2="15" />
          </svg>
          Share the Love
        </>
      )}
    </Button>
  )
}

// Info icon with tooltip
function InfoTooltip({ text }: { text: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="ml-1.5 inline-flex cursor-help">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-muted-foreground/50 hover:text-muted-foreground transition-colors"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
          </svg>
        </span>
      </TooltipTrigger>
      <TooltipContent side="top">{text}</TooltipContent>
    </Tooltip>
  )
}

// Stat descriptions for tooltips
const STAT_DESCRIPTIONS = {
  residues:
    'Amino acids in your protein sequence. Each letter in your names becomes one residue.',
  atoms:
    'Total atoms making up the 3D structure. More atoms = more molecular detail.',
  uniqueness:
    'How structurally novel your protein is. Higher = more one-of-a-kind shape.',
  dimensions:
    'The 3D bounding box of your protein in Ångströms (1Å = 0.1 nanometers).',
  mass: 'Estimated molecular weight. For reference, water is 0.018 kDa.',
  backbone: "Alpha carbon atoms forming the protein's spine. One per residue.",
}

// Protein stats card component
function ProteinStatsCard({
  pdbData,
  sequence,
}: {
  pdbData: string
  sequence: string
}) {
  const stats = useMemo(() => parsePdbStats(pdbData), [pdbData])
  const personality = useMemo(
    () => getProteinPersonality(stats, sequence),
    [stats, sequence],
  )

  if (stats.atomCount === 0) return null

  return (
    <motion.div
      className="mt-6 rounded-xl border border-border/50 bg-card/80 p-4 backdrop-blur-sm"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      {/* Personality description */}
      <p className="mb-4 text-center text-sm text-muted-foreground italic">
        "{personality}"
      </p>

      <h3 className="mb-3 text-sm font-medium text-muted-foreground uppercase tracking-wider">
        Structure Data
      </h3>

      <table className="w-full text-sm">
        <tbody className="divide-y divide-border/50">
          <tr>
            <td className="py-1.5 text-muted-foreground">
              <span className="inline-flex items-center">
                Residues
                <InfoTooltip text={STAT_DESCRIPTIONS.residues} />
              </span>
            </td>
            <td className="py-1.5 text-right font-mono text-foreground">
              {stats.residueCount}
            </td>
          </tr>
          <tr>
            <td className="py-1.5 text-muted-foreground">
              <span className="inline-flex items-center">
                Atoms
                <InfoTooltip text={STAT_DESCRIPTIONS.atoms} />
              </span>
            </td>
            <td className="py-1.5 text-right font-mono text-foreground">
              {stats.atomCount.toLocaleString()}
            </td>
          </tr>
          <tr>
            <td className="py-1.5 text-muted-foreground">
              <span className="inline-flex items-center">
                Uniqueness
                <InfoTooltip text={STAT_DESCRIPTIONS.uniqueness} />
              </span>
            </td>
            <td className="py-1.5 text-right font-mono text-foreground">
              {(100 - stats.averagePlddt).toFixed(1)}
              <span className="ml-1 text-xs text-muted-foreground">/ 100</span>
            </td>
          </tr>
          <tr>
            <td className="py-1.5 text-muted-foreground">
              <span className="inline-flex items-center">
                Dimensions (Å)
                <InfoTooltip text={STAT_DESCRIPTIONS.dimensions} />
              </span>
            </td>
            <td className="py-1.5 text-right font-mono text-foreground">
              {stats.dimensions.width.toFixed(1)} ×{' '}
              {stats.dimensions.height.toFixed(1)} ×{' '}
              {stats.dimensions.depth.toFixed(1)}
            </td>
          </tr>
          <tr>
            <td className="py-1.5 text-muted-foreground">
              <span className="inline-flex items-center">
                Est. Mass
                <InfoTooltip text={STAT_DESCRIPTIONS.mass} />
              </span>
            </td>
            <td className="py-1.5 text-right font-mono text-foreground">
              {stats.molecularWeight.toFixed(1)}
              <span className="ml-1 text-xs text-muted-foreground">kDa</span>
            </td>
          </tr>
          <tr>
            <td className="py-1.5 text-muted-foreground">
              <span className="inline-flex items-center">
                Backbone (Cα)
                <InfoTooltip text={STAT_DESCRIPTIONS.backbone} />
              </span>
            </td>
            <td className="py-1.5 text-right font-mono text-foreground">
              {stats.backboneAtoms}
            </td>
          </tr>
        </tbody>
      </table>
    </motion.div>
  )
}
