"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

type ThemeColor = {
  name: string
  value: string
  bgColor: string
  textColor: string
}

type ThemeContextType = {
  theme: string
  setTheme: (theme: string) => void
  colorTheme: string
  setColorTheme: (colorTheme: string) => void
  availableColorThemes: ThemeColor[]
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

// Define available color themes with improved contrast
const colorThemes: ThemeColor[] = [
  { name: "Default", value: "default", bgColor: "bg-slate-900", textColor: "text-slate-50" },
  { name: "Light", value: "light", bgColor: "bg-sky-100", textColor: "text-sky-900" },
  { name: "Blue", value: "blue", bgColor: "bg-blue-600", textColor: "text-white" },
  { name: "Green", value: "green", bgColor: "bg-emerald-600", textColor: "text-white" },
  { name: "Purple", value: "purple", bgColor: "bg-purple-600", textColor: "text-white" },
  { name: "Rose", value: "rose", bgColor: "bg-rose-600", textColor: "text-white" },
  { name: "Amber", value: "amber", bgColor: "bg-amber-600", textColor: "text-white" },
  { name: "Teal", value: "teal", bgColor: "bg-teal-600", textColor: "text-white" },
]

export function ThemeContextProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState("system")
  const [colorTheme, setColorTheme] = useState("light")

  // Initialize theme from localStorage on mount
  useEffect(() => {
    const storedTheme = localStorage.getItem("theme")
    const storedColorTheme = localStorage.getItem("colorTheme")

    if (storedTheme) {
      setTheme(storedTheme)
    }

    if (storedColorTheme) {
      setColorTheme(storedColorTheme)
    }
  }, [])

  // Direct DOM manipulation to ensure theme changes take effect
  const applyTheme = (newTheme: string, newColorTheme: string) => {
    // Apply theme (light/dark)
    document.documentElement.setAttribute("data-theme", newTheme)
    localStorage.setItem("theme", newTheme)

    // Apply color theme
    document.documentElement.setAttribute("data-color-theme", newColorTheme)
    localStorage.setItem("colorTheme", newColorTheme)

    console.log(`Theme applied: ${newTheme}, Color theme: ${newColorTheme}`)
  }

  // Update theme when it changes
  useEffect(() => {
    applyTheme(theme, colorTheme)
  }, [theme, colorTheme])

  // Create a wrapper for setColorTheme that ensures the theme is applied
  const handleSetColorTheme = (newColorTheme: string) => {
    console.log("Setting color theme to:", newColorTheme)
    setColorTheme(newColorTheme)
    applyTheme(theme, newColorTheme)
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        colorTheme,
        setColorTheme: handleSetColorTheme,
        availableColorThemes: colorThemes,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeContextProvider")
  }
  return context
}
