import * as React from "react"

import {
  ThemeProviderContext,
  STORAGE_KEY,
  getStoredTheme,
  getSystemTheme,
  resolveTheme,
  type Theme,
} from "@/hooks/theme-context"

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = STORAGE_KEY,
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<Theme>(() => {
    if (typeof window === "undefined") return defaultTheme
    const stored = getStoredTheme(storageKey)
    if (stored) return stored
    return defaultTheme
  })

  const [resolvedTheme, setResolvedTheme] = React.useState<"light" | "dark">(
    () => {
      if (typeof window === "undefined") return resolveTheme(defaultTheme)
      const isDark = document.documentElement.classList.contains("dark")
      return isDark ? "dark" : "light"
    }
  )

  const applyTheme = React.useCallback((resolved: "light" | "dark") => {
    if (typeof window === "undefined") return
    const root = document.documentElement
    if (resolved === "dark") {
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
    }
    setResolvedTheme(resolved)
  }, [])

  const setTheme = React.useCallback(
    (newTheme: Theme) => {
      setThemeState(newTheme)
      try {
        localStorage.setItem(storageKey, newTheme)
      } catch {
        // localStorage might be unavailable
      }
      const resolved = resolveTheme(newTheme)
      applyTheme(resolved)
    },
    [storageKey, applyTheme]
  )

  React.useEffect(() => {
    if (theme !== "system") return
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const handleChange = () => {
      const resolved = getSystemTheme()
      applyTheme(resolved)
    }
    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [theme, applyTheme])

  React.useEffect(() => {
    const resolved = resolveTheme(theme)
    applyTheme(resolved)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const value = React.useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
    }),
    [theme, resolvedTheme, setTheme]
  )

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}
