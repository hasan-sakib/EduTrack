"use client"

import * as React from "react"

export interface ColorTheme {
  id: string
  label: string
  swatch: string
}

export const COLOR_THEMES: ColorTheme[] = [
  { id: "minimal", label: "Minimal", swatch: "oklch(0.145 0 0)" },
  { id: "edutrack", label: "EduTrack", swatch: "oklch(0.55 0.13 195)" },
  { id: "indigo", label: "Indigo", swatch: "oklch(0.511 0.262 276.966)" },
  { id: "slate", label: "Slate", swatch: "oklch(0.32 0.045 235)" },
]

const COLOR_THEME_KEY = "edutrack:color-theme"
const DEFAULT_COLOR_THEME = "minimal"

interface ThemeColorContextValue {
  colorTheme: string
  setColorTheme: (id: string) => void
}

const ThemeColorContext = React.createContext<ThemeColorContextValue | null>(null)

export function ThemeColorProvider({ children }: { children: React.ReactNode }) {
  const [colorTheme, setColorThemeState] = React.useState(DEFAULT_COLOR_THEME)

  React.useEffect(() => {
    const stored = localStorage.getItem(COLOR_THEME_KEY)
    if (stored) setColorThemeState(stored)
  }, [])

  React.useEffect(() => {
    document.documentElement.dataset.colorTheme = colorTheme
  }, [colorTheme])

  function setColorTheme(id: string) {
    localStorage.setItem(COLOR_THEME_KEY, id)
    setColorThemeState(id)
  }

  return (
    <ThemeColorContext.Provider value={{ colorTheme, setColorTheme }}>
      {children}
    </ThemeColorContext.Provider>
  )
}

export function useThemeColor() {
  const ctx = React.useContext(ThemeColorContext)
  if (!ctx) throw new Error("useThemeColor must be used within a ThemeColorProvider")
  return ctx
}
