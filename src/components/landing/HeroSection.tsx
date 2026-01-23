import * as React from "react"
import { Link } from "@tanstack/react-router"
import { motion, useReducedMotion } from "motion/react"

import { DNAHeart } from "./DNAHeart"
import { Section } from "./Section"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

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
        "relative flex items-center py-8 lg:py-20 overflow-hidden",
        // Mobile: auto height, Desktop: full viewport minus nav
        "min-h-0 lg:min-h-[calc(100vh-5rem)]",
        className
      )}
      aria-labelledby="hero-headline"
      role="region"
      {...props}
    >
      {/* 3D DNA Heart - absolutely positioned on desktop, in-flow on mobile */}
      <motion.div
        className={cn(
          // Mobile: in-flow, centered, fills width
          "relative flex items-center justify-center",
          "w-full max-w-[700px] aspect-square mx-auto -mb-8",
          // Desktop: absolute positioned like original
          "lg:absolute lg:top-1/2 lg:left-1/2 lg:-translate-x-[20%] lg:-translate-y-1/2",
          "lg:w-[1250px] lg:max-w-none lg:h-[1250px] lg:mb-0 lg:mx-0",
          "lg:z-20"
        )}
        initial="hidden"
        animate="visible"
        variants={visualVariants}
        aria-hidden="true"
      >
        {/* Soft animated glow background */}
        <div
          className="absolute inset-[15%] rounded-full blur-[100px] lg:blur-[200px] animate-pulse bg-pink-500/40 dark:bg-pink-500/20"
          style={{ animationDuration: "8s" }}
          aria-hidden="true"
        />

        {/* 3D DNA Heart */}
        <div
          className="relative w-full h-full"
          role="img"
          aria-label="Interactive 3D DNA double helix shaped like a heart, representing love through molecular biology"
        >
          <DNAHeart className="w-full h-full" />
        </div>
      </motion.div>

      {/* Text Content - on top of heart for readability */}
      <div className="relative z-30 grid w-full lg:grid-cols-2 lg:items-center pointer-events-none">
        <motion.div
          className="flex flex-col gap-6 text-center lg:text-left pointer-events-auto"
          initial="hidden"
          animate="visible"
          variants={textVariants}
        >
          <h1
            id="hero-headline"
            className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl"
          >
            Love at the{" "}
            <span 
              className="text-primary whitespace-nowrap"
              style={{ 
                filter: "drop-shadow(0 0 5px rgba(244, 114, 182, 0.5))",
              }}
            >
              molecular level
            </span>
          </h1>

          <p className="text-lg text-muted-foreground sm:text-xl max-w-2xl mx-auto lg:mx-0">
            Two names → one amino acid sequence → a 3D protein that only exists for you two. 
            Powered by the same AI that helps scientists discover new medicines.
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
                Fold Our Names
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </Section>
  )
}

export { HeroSection }
export type { HeroSectionProps }
