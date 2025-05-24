"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes"
import { useAppStore } from "@/lib/store"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const { ui, setUI } = useAppStore()

  React.useEffect(() => {
    // Sync theme with store
    if (ui.theme !== "system") {
      document.documentElement.classList.toggle("dark", ui.theme === "dark")
    }
  }, [ui.theme])

  return (
    <NextThemesProvider
      {...props}
      forcedTheme={ui.theme === "system" ? undefined : ui.theme}
      onThemeChange={(theme) => {
        setUI({ theme: theme as "light" | "dark" | "system" })
      }}
    >
      {children}
    </NextThemesProvider>
  )
}
