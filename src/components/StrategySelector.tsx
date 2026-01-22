import { cn } from '@/lib/utils'
import { LINKER_CONFIGS, type LinkerStrategy } from '@/utils/foldLogic'

interface StrategySelectorProps {
  selectedStrategy: LinkerStrategy
  onStrategyChange: (strategy: LinkerStrategy) => void
  className?: string
}

// Strategy icons for visual distinction
function FlexibleIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
    >
      <path d="M4 12c0-3 2-6 6-6s6 3 6 6-2 6-6 6" />
      <path d="M14 12c0 3 2 6 6 6" />
    </svg>
  )
}

function AnchorIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
    >
      <circle cx="12" cy="5" r="3" />
      <line x1="12" y1="8" x2="12" y2="21" />
      <path d="M5 12H2a10 10 0 0 0 20 0h-3" />
    </svg>
  )
}

function CysteineIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
    >
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  )
}

const STRATEGY_ICONS: Record<LinkerStrategy, React.ReactNode> = {
  flexible: <FlexibleIcon />,
  anchor: <AnchorIcon />,
  cysteine: <CysteineIcon />,
}

export function StrategySelector({
  selectedStrategy,
  onStrategyChange,
  className,
}: StrategySelectorProps) {
  const strategies: LinkerStrategy[] = ['flexible', 'anchor', 'cysteine']

  return (
    <div className={cn('space-y-3', className)}>
      <div className="text-center">
        <h3 className="text-sm font-medium text-pink-700 dark:text-pink-300">Choose Your Bond Type</h3>
        <p className="text-xs text-pink-500 dark:text-pink-400">Each creates a unique protein shape</p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {strategies.map((strategy) => {
          const config = LINKER_CONFIGS[strategy]
          const isSelected = selectedStrategy === strategy

          return (
            <button
              key={strategy}
              onClick={() => onStrategyChange(strategy)}
              className={cn(
                // Base styles
                'relative flex flex-col items-center gap-2 rounded-xl p-4 text-center transition-all duration-200',
                // Border and shadow
                'border-2',
                // Selected state
                isSelected
                  ? 'border-pink-400 bg-pink-100/80 shadow-lg shadow-pink-200/50 dark:border-pink-500 dark:bg-pink-950/60 dark:shadow-pink-900/30'
                  : 'border-pink-200/50 bg-white/60 hover:border-pink-300 hover:bg-pink-50/80 hover:shadow-md dark:border-pink-800/50 dark:bg-pink-950/30 dark:hover:border-pink-600 dark:hover:bg-pink-900/40',
                // Focus state for accessibility
                'focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2 dark:focus:ring-pink-500 dark:focus:ring-offset-background'
              )}
              aria-pressed={isSelected}
              aria-label={`Select ${config.displayName} strategy`}
            >
              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-pink-500 text-white">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              )}

              {/* Icon */}
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full',
                  isSelected
                    ? 'bg-pink-500 text-white'
                    : 'bg-pink-100 text-pink-500 dark:bg-pink-900/50 dark:text-pink-400'
                )}
              >
                {STRATEGY_ICONS[strategy]}
              </div>

              {/* Display name */}
              <span
                className={cn(
                  'text-sm font-semibold',
                  isSelected ? 'text-pink-700 dark:text-pink-200' : 'text-pink-600 dark:text-pink-300'
                )}
              >
                {config.displayName}
              </span>

              {/* Description */}
              <span className="text-xs text-pink-500/80 dark:text-pink-400/80 leading-tight">
                {config.description}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
