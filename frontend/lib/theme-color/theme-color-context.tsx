"use client"

import * as React from "react"

export interface ColorTheme {
  id: string
  label: string
  swatch: string
}

export const COLOR_THEMES: ColorTheme[] = [
  { id: "mono-ink", label: "Mono ink", swatch: "oklch(0.145 0 0)" },
  { id: "spring-pastel", label: "Spring pastel", swatch: "oklch(0.78 0.11 152)" },
  { id: "edutrack", label: "EduTrack color", swatch: "oklch(0.55 0.13 195)" },
  {
    id: "multi",
    label: "Multi color",
    swatch: "linear-gradient(135deg, oklch(0.62 0.19 25), oklch(0.68 0.17 95), oklch(0.6 0.18 195), oklch(0.58 0.22 300))",
  },
  { id: "sky-blue", label: "Sky Blue", swatch: "oklch(0.62 0.15 230)" },
  { id: "green", label: "Green", swatch: "oklch(0.55 0.16 145)" },
  { id: "white", label: "White", swatch: "oklch(1 0 0)" },
  { id: "black", label: "Black", swatch: "oklch(0.145 0 0)" },
]

const COLOR_THEME_KEY = "edutrack:color-theme"
const DEFAULT_COLOR_THEME = "mono-ink"

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
