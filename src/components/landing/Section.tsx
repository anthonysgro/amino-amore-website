import * as React from "react"

import { cn } from "@/lib/utils"

interface SectionProps extends React.ComponentProps<"section"> {
  className?: string
  children: React.ReactNode
}

function Section({ className, children, ...props }: SectionProps) {
  return (
    <section
      data-slot="section"
      className={cn(
        "mx-auto w-full max-w-7xl px-6 md:px-10 lg:px-16",
        className
      )}
      {...props}
    >
      {children}
    </section>
  )
}

export { Section }
export type { SectionProps }
