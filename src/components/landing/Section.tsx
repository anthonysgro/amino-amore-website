import * as React from 'react'

import { cn } from '@/lib/utils'

/** Background tint options for visual rhythm between sections */
type SectionTint = 'none' | 'subtle'

interface SectionProps extends React.ComponentProps<'section'> {
  /** Use narrow variant for text-heavy content (720px max-width) */
  narrow?: boolean
  /** Use full variant for full-width sections (1200px max-width) */
  full?: boolean
  /** Background tint for visual rhythm */
  tint?: SectionTint
}

const tintClasses: Record<SectionTint, string> = {
  none: '',
  subtle: 'bg-black/[0.02] dark:bg-white/[0.01]',
}

/**
 * Section wrapper component providing consistent spacing and max-width constraints.
 *
 * - Default: 1200px max-width
 * - Narrow: 720px max-width for text-heavy content
 * - Spacing: 96px vertical padding between sections
 * - Tint: Optional background color for visual rhythm
 */
function Section({
  className,
  narrow = false,
  full = false,
  tint = 'none',
  children,
  ...props
}: SectionProps) {
  return (
    <section
      data-slot="section"
      data-narrow={narrow || undefined}
      data-full={full || undefined}
      data-tint={tint !== 'none' ? tint : undefined}
      className={cn(
        // Base section spacing - 96px between sections
        'py-24',
        // Responsive horizontal padding
        'px-6 md:px-12 lg:px-16',
        // Background tint for visual rhythm
        tintClasses[tint],
        className,
      )}
      {...props}
    >
      <div
        className={cn(
          'mx-auto w-full',
          // Width constraints based on variant
          narrow ? 'max-w-[720px]' : 'max-w-[1200px]',
        )}
      >
        {children}
      </div>
    </section>
  )
}

export { Section }
export type { SectionProps, SectionTint }
