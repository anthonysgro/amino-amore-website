import * as React from "react"
import { Link } from "@tanstack/react-router"
import { motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Section } from "./Section"
import { DNAHeart } from "./DNAHeart"

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
              className={cn(
                "bg-primary text-primary-foreground",
                "hover:brightness-95 transition-all",
                "px-8 py-4 h-auto rounded-md",
                "font-semibold text-lg",
                "shadow-md hover:shadow-lg",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              )}
            >
              <Link
                to="/create"
                aria-label="Create Your Love Protein - start the protein folding experience"
              >
                Create Your Love Protein
              </Link>
            </Button>
          </div>
        </motion.div>

        {/* Visual Element - 3D DNA Heart */}
        <motion.div
          className="relative flex items-center justify-center order-first lg:order-last"
          initial="hidden"
          animate="visible"
          variants={visualVariants}
          aria-hidden="true"
        >
          {/* Decorative gradient background */}
          <div
            className="absolute inset-0 bg-linear-to-br from-pink-500/10 via-rose-500/10 to-purple-500/10 blur-3xl"
            aria-hidden="true"
          />

          {/* 3D DNA Heart - no container box */}
          <div
            className="relative aspect-square w-full max-w-xl"
            role="img"
            aria-label="Interactive 3D DNA double helix shaped like a heart, representing love through molecular biology"
          >
            <DNAHeart className="w-full h-full" />
          </div>
        </motion.div>
      </div>
    </Section>
  )
}

export { HeroSection }
export type { HeroSectionProps }
