import * as React from 'react'

import { ThemeProviderContext } from '@/hooks/theme-context'

interface ThemeProviderProps {
  children: React.ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  // Always force dark mode
  React.useEffect(() => {
    document.documentElement.classList.add('dark')
  }, [])

  const value = React.useMemo(
    () => ({
      theme: 'dark' as const,
      resolvedTheme: 'dark' as const,
      setTheme: () => {}, // No-op, always dark
    }),
    [],
  )

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}
