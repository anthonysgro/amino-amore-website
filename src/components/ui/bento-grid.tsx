import * as React from "react"
import { cva } from "class-variance-authority"

import type { VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const bentoGridVariants = cva("grid gap-4 md:gap-6", {
  variants: {
    columns: {
      1: "grid-cols-1",
      2: "grid-cols-1 md:grid-cols-2",
      3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
      4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
    },
  },
  defaultVariants: {
    columns: 3,
  },
})

interface BentoGridProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof bentoGridVariants> {}

function BentoGrid({ columns, className, children, ...props }: BentoGridProps) {
  return (
    <div
      data-slot="bento-grid"
      className={cn(bentoGridVariants({ columns }), className)}
      {...props}
    >
      {children}
    </div>
  )
}

const bentoGridItemVariants = cva("", {
  variants: {
    colSpan: {
      1: "col-span-1",
      2: "col-span-1 md:col-span-2",
      3: "col-span-1 md:col-span-2 lg:col-span-3",
    },
    rowSpan: {
      1: "row-span-1",
      2: "row-span-1 md:row-span-2",
    },
  },
  defaultVariants: {
    colSpan: 1,
    rowSpan: 1,
  },
})

interface BentoGridItemProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof bentoGridItemVariants> {}

function BentoGridItem({
  colSpan,
  rowSpan,
  className,
  children,
  ...props
}: BentoGridItemProps) {
  return (
    <div
      data-slot="bento-grid-item"
      className={cn(bentoGridItemVariants({ colSpan, rowSpan }), className)}
      {...props}
    >
      {children}
    </div>
  )
}

export { BentoGrid, BentoGridItem, bentoGridVariants, bentoGridItemVariants }
export type { BentoGridProps, BentoGridItemProps }
