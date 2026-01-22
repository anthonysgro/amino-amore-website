import * as React from "react"

export type Theme = "light" | "dark" | "system"

export interface ThemeProviderState {
  theme: Theme
  resolvedTheme: "light" | "dark"
  setTheme: (theme: Theme) => void
}

export const ThemeProviderContext = React.createContext<
  ThemeProviderState | undefined
>(undefined)

export const STORAGE_KEY = "folded-love-theme"

export function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light"
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light"
}

export function getStoredTheme(storageKey: string): Theme | null {
  if (typeof window === "undefined") return null
  try {
    const stored = localStorage.getItem(storageKey)
    if (stored === "light" || stored === "dark" || stored === "system") {
      return stored
    }
    return null
  } catch {
    return null
  }
}

export function resolveTheme(theme: Theme): "light" | "dark" {
  if (theme === "system") {
    return getSystemTheme()
  }
  return theme
}
