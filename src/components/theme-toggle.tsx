import * as React from "react"
import { Moon, Sun } from "lucide-react"

import { cn } from "@/lib/utils"
import { useTheme } from "@/hooks/use-theme"

export interface ThemeToggleProps {
  className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme()
  const [announcement, setAnnouncement] = React.useState<string>("")

  const isDark = resolvedTheme === "dark"

  const handleToggle = React.useCallback(() => {
    const newTheme = isDark ? "light" : "dark"
    setTheme(newTheme)
    setAnnouncement(`Theme changed to ${newTheme} mode`)
    setTimeout(() => setAnnouncement(""), 1000)
  }, [isDark, setTheme])

  const ariaLabel = isDark ? "Switch to light mode" : "Switch to dark mode"

  return (
    <>
      <button
        type="button"
        onClick={handleToggle}
        className={cn(
          "inline-flex items-center justify-center",
          "h-10 w-10 min-h-[44px] min-w-[44px]",
          "rounded-md",
          "text-muted-foreground",
          "hover:text-foreground hover:bg-muted/50",
          "cursor-pointer",
          "transition-colors duration-200",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          className
        )}
        aria-label={ariaLabel}
      >
        {isDark ? (
          <Sun className="h-5 w-5" aria-hidden="true" />
        ) : (
          <Moon className="h-5 w-5" aria-hidden="true" />
        )}
      </button>
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>
    </>
  )
}
