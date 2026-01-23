import { motion, useReducedMotion } from 'motion/react'
import { Clock, Fingerprint, Heart, Share2, Sparkles, Zap } from 'lucide-react'

import { cn } from '@/lib/utils'
import { BentoGrid, BentoGridItem } from '@/components/ui/bento-grid'
import { FeatureCard } from './FeatureCard'
import { Section } from './Section'

interface Feature {
  id: string
  icon: React.ReactNode
  title: string
  description: string
  size: 'sm' | 'md' | 'lg'
  colSpan?: 1 | 2
}

const features: Feature[] = [
  {
    id: 'names',
    icon: <Heart className="h-5 w-5" />,
    title: 'Just Two Names',
    description: "That's it. Type them in and watch the magic happen.",
    size: 'lg',
    colSpan: 2,
  },
  {
    id: 'unique',
    icon: <Fingerprint className="h-5 w-5" />,
    title: 'Mathematically Unique',
    description:
      'Your name combo maps to a specific amino acid sequence. No one else has this protein.',
    size: 'sm',
  },
  {
    id: 'fast',
    icon: <Clock className="h-5 w-5" />,
    title: '~10 Seconds',
    description:
      'ESMFold runs the same prediction that used to take supercomputers days.',
    size: 'sm',
  },
  {
    id: 'science',
    icon: <Sparkles className="h-5 w-5" />,
    title: 'Actual Science',
    description:
      'This is the tech behind AlphaFold. Nobel prize winning stuff, for your relationship.',
    size: 'sm',
  },
  {
    id: 'share',
    icon: <Share2 className="h-5 w-5" />,
    title: 'Send It',
    description:
      "Screenshot it, share the link, make it your lock screen. We don't judge.",
    size: 'sm',
  },
  {
    id: 'free',
    icon: <Zap className="h-5 w-5" />,
    title: 'Free Forever',
    description: 'No account, no paywall, no catch. Just love and proteins.',
    size: 'lg',
    colSpan: 2,
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

const gridContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const gridItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] as const },
  },
}

const staticVariants = {
  hidden: { opacity: 1 },
  visible: { opacity: 1 },
}

interface HowItWorksSectionProps extends React.ComponentProps<typeof Section> {
  className?: string
}

export function HowItWorksSection({
  className,
  ...props
}: HowItWorksSectionProps) {
  const prefersReducedMotion = useReducedMotion()
  const MotionDiv = prefersReducedMotion ? 'div' : motion.div

  return (
    <Section
      id="how-it-works"
      className={cn('pt-32 pb-32 lg:pt-48 lg:pb-48', className)}
      {...props}
    >
      <MotionDiv
        className="mb-12 text-center"
        {...(!prefersReducedMotion && {
          initial: 'hidden',
          whileInView: 'visible',
          viewport: { once: true, margin: '-100px' },
          variants: sectionHeaderVariants,
        })}
      >
        <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
          Love, Visualized
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          No two proteins are the same. Yours is literally one of a kind.
        </p>
      </MotionDiv>

      <MotionDiv
        {...(!prefersReducedMotion && {
          initial: 'hidden',
          whileInView: 'visible',
          viewport: { once: true, margin: '-50px' },
          variants: gridContainerVariants,
        })}
      >
        <BentoGrid columns={4}>
          {features.map((feature) => (
            <BentoGridItem key={feature.id} colSpan={feature.colSpan}>
              {prefersReducedMotion ? (
                <FeatureCard
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  size={feature.size}
                  interactive={false}
                />
              ) : (
                <motion.div variants={gridItemVariants} className="h-full">
                  <FeatureCard
                    icon={feature.icon}
                    title={feature.title}
                    description={feature.description}
                    size={feature.size}
                  />
                </motion.div>
              )}
            </BentoGridItem>
          ))}
        </BentoGrid>
      </MotionDiv>
    </Section>
  )
}
