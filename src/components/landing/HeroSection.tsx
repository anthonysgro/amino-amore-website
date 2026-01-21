import * as React from "react"
import { Link } from "@tanstack/react-router"
import { motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Section } from "./Section"

interface HeroSectionProps extends React.ComponentProps<"section"> {
  className?: string
}

// Animation variants for text content (fade + slide)
const heroTextVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
  },
}

// Animation variants for visual element (fade + scale)
const heroVisualVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1], delay: 0.2 },
  },
}

// Static variants for reduced motion
const staticVariants = {
  hidden: { opacity: 1 },
  visible: { opacity: 1 },
}

function HeroSection({ className, ...props }: HeroSectionProps) {
  const shouldReduceMotion = useReducedMotion()

  const textVariants = shouldReduceMotion ? staticVariants : heroTextVariants
  const visualVariants = shouldReduceMotion ? staticVariants : heroVisualVariants

  return (
    <Section
      className={cn(
        "min-h-[calc(100vh-5rem)] flex items-center py-12 lg:py-20",
        className
      )}
      aria-labelledby="hero-headline"
      role="region"
      {...props}
    >
      {/* Grid layout: stacked on mobile, side-by-side on desktop */}
      <div className="grid w-full gap-12 lg:grid-cols-2 lg:gap-16 lg:items-center">
        {/* Text Content */}
        <motion.div
          className="flex flex-col gap-6 text-center lg:text-left"
          initial="hidden"
          animate="visible"
          variants={textVariants}
        >
          <h1
            id="hero-headline"
            className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl"
          >
            Transform Your Love Into{" "}
            <span className="text-primary">Molecular Art</span>
          </h1>

          <p className="text-lg text-muted-foreground sm:text-xl max-w-2xl mx-auto lg:mx-0">
            Enter your names and watch as science weaves them into a unique 3D
            protein structure — a one-of-a-kind "Love Protein" that represents
            your bond in biological form.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
            <Button
              asChild
              size="lg"
              className="text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <Link
                to="/fold/$names"
                params={{ names: "Your-Love" }}
                aria-label="Create Your Love Protein - start the protein folding experience"
              >
                Create Your Love Protein
              </Link>
            </Button>
          </div>
        </motion.div>

        {/* Visual Element */}
        <motion.div
          className="relative flex items-center justify-center order-first lg:order-last"
          initial="hidden"
          animate="visible"
          variants={visualVariants}
          aria-hidden="true"
        >
          {/* Decorative gradient background */}
          <div
            className="absolute inset-0 rounded-3xl bg-linear-to-br from-chart-1/20 via-chart-2/20 to-chart-4/20 blur-3xl"
            aria-hidden="true"
          />

          {/* Hero visual container */}
          <div
            className="relative aspect-square w-full max-w-md rounded-3xl bg-linear-to-br from-chart-1/30 via-chart-2/40 to-chart-4/30 p-1 shadow-2xl shadow-primary/20"
            role="img"
            aria-label="Decorative protein structure visualization representing love and connection"
          >
            <div className="flex h-full w-full items-center justify-center rounded-[calc(1.5rem-4px)] bg-background/80 backdrop-blur-sm">
              {/* Decorative protein/heart visual */}
              <div className="relative">
                {/* Animated rings */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-48 w-48 rounded-full border-2 border-chart-2/30 animate-pulse" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-36 w-36 rounded-full border-2 border-chart-3/40" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-24 w-24 rounded-full border-2 border-chart-4/50" />
                </div>

                {/* Center heart/protein icon */}
                <div className="relative flex h-64 w-64 items-center justify-center">
                  <span className="text-7xl" aria-hidden="true">
                    🧬
                  </span>
                  <span
                    className="absolute -right-2 -top-2 text-4xl"
                    aria-hidden="true"
                  >
                    💕
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </Section>
  )
}

export { HeroSection }
export type { HeroSectionProps }
