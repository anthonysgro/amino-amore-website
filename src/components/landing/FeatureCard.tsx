import * as React from "react"
import { motion, useReducedMotion } from "motion/react"
import { cva } from "class-variance-authority"

import type { VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const featureCardVariants = cva(
  "h-full rounded-2xl border p-6 transition-colors",
  {
    variants: {
      size: {
        sm: "",
        md: "",
        lg: "",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
)

interface FeatureCardProps
  extends Omit<React.ComponentProps<"div">, "title">,
    VariantProps<typeof featureCardVariants> {
  icon?: React.ReactNode
  title: string
  description: string
  visual?: React.ReactNode
  interactive?: boolean
}

function FeatureCard({
  className,
  size,
  icon,
  title,
  description,
  visual,
  interactive = true,
  ...props
}: FeatureCardProps) {
  const prefersReducedMotion = useReducedMotion()

  const cardContent = (
    <div
      className={cn(
        featureCardVariants({ size }),
        "border-border/50 bg-card/50",
        "hover:border-primary/20 hover:bg-card/80",
        className
      )}
      {...props}
    >
      {icon && (
        <div
          className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"
          aria-hidden="true"
        >
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      {visual && (
        <div className="mt-4 flex items-center justify-center">{visual}</div>
      )}
    </div>
  )

  if (interactive && !prefersReducedMotion) {
    return (
      <motion.div
        className="h-full"
        whileHover={{ scale: 1.02, y: -4 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {cardContent}
      </motion.div>
    )
  }

  return cardContent
}

export { FeatureCard, featureCardVariants }
export type { FeatureCardProps }
