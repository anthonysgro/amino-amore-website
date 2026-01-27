import { motion, useReducedMotion } from 'motion/react'
import { ArrowRight } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Section } from './Section'

interface Step {
  number: string
  title: string
  description: React.ReactNode
  example?: {
    input: string
    output: string
  }
}

const steps: Array<Step> = [
  {
    number: '01',
    title: 'Names become letters',
    description:
      'Each letter in your names maps to one of 20 amino acids — the building blocks of all proteins in nature.',
    example: {
      input: 'ALICE',
      output: 'A → L → I → C → E',
    },
  },
  {
    number: '02',
    title: 'We add a molecular bridge',
    description:
      'A flexible "linker" sequence connects your two names, giving the protein room to fold into interesting shapes.',
    example: {
      input: 'ALICE + BOB',
      output: 'ALICE—GGSGGS—NQN',
    },
  },
  {
    number: '03',
    title: 'AI predicts the 3D shape',
    description: (
      <>
        <a
          href="https://esmatlas.com/about#api"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          ESMFold
        </a>{' '}
        (the tech behind AlphaFold) simulates how your amino acid chain would
        fold in real life. This used to take supercomputers days — now it takes
        seconds.
      </>
    ),
    example: {
      input: 'Amino sequence',
      output: '3D coordinates',
    },
  },
  {
    number: '04',
    title: 'Your protein comes to life',
    description:
      'We render the predicted structure as an interactive 3D model you can spin, zoom, and screenshot. The shape is mathematically unique to your name combination.',
    example: {
      input: 'PDB file',
      output: '💕 Your Love Protein',
    },
  },
]

const sectionHeaderVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const },
  },
}

const stepVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const },
  },
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
}

interface ScienceSectionProps extends React.ComponentProps<typeof Section> {
  className?: string
}

export function ScienceSection({ className, ...props }: ScienceSectionProps) {
  const prefersReducedMotion = useReducedMotion()
  const MotionDiv = prefersReducedMotion ? 'div' : motion.div

  return (
    <Section
      id="how-it-works"
      className={cn('pt-24 pb-24 lg:pt-32 lg:pb-32', className)}
      {...props}
    >
      <MotionDiv
        className="mb-16 text-center"
        {...(!prefersReducedMotion && {
          initial: 'hidden',
          whileInView: 'visible',
          viewport: { once: true, margin: '-100px' },
          variants: sectionHeaderVariants,
        })}
      >
        <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
          How It Works
        </h2>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Real protein folding science, simplified. Here's what happens when you
          enter your names.
        </p>
      </MotionDiv>

      <MotionDiv
        className="max-w-3xl mx-auto"
        {...(!prefersReducedMotion && {
          initial: 'hidden',
          whileInView: 'visible',
          viewport: { once: true, margin: '-50px' },
          variants: containerVariants,
        })}
      >
        <div className="relative">
          {/* Vertical line connecting steps - positioned to go between circles, not through them */}
          {/* Circles are 48px (h-12), so line starts at 48px (after first circle) and ends 48px from bottom */}
          <div className="absolute left-[23px] top-12 bottom-12 w-0.5 bg-linear-to-b from-primary/40 via-primary/20 to-primary/40 hidden sm:block" />

          <div className="space-y-8 sm:space-y-12">
            {steps.map((step) => (
              <MotionDiv
                key={step.number}
                className="relative"
                {...(!prefersReducedMotion && { variants: stepVariants })}
              >
                <div className="flex gap-4 sm:gap-6">
                  {/* Step number - z-10 to appear above the line */}
                  <div className="shrink-0 w-12 h-12 rounded-full bg-background border-2 border-primary/30 flex items-center justify-center z-10">
                    <span className="text-sm font-bold text-primary">
                      {step.number}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-1">
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>

                    {/* Example visualization */}
                    {step.example && (
                      <div className="mt-4 p-4 rounded-lg bg-muted/30 border border-border/50">
                        <div className="flex items-center gap-3 text-sm font-mono flex-wrap">
                          <span className="text-foreground/80">
                            {step.example.input}
                          </span>
                          <ArrowRight className="h-4 w-4 text-primary shrink-0" />
                          <span className="text-primary font-medium">
                            {step.example.output}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </MotionDiv>
            ))}
          </div>
        </div>
      </MotionDiv>
    </Section>
  )
}
