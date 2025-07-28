"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="fixed top-4 left-4 z-50">
        <Button variant="outline" size="sm" className="gap-2 bg-transparent">
          <Sun className="h-4 w-4" />
          <span className="hidden sm:inline">Day Mode</span>
        </Button>
      </div>
    )
  }

  const isDark = theme === "dark"

  return (
    <div className="fixed top-4 left-4 z-50">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setTheme(isDark ? "light" : "dark")}
        className={`gap-2 transition-all duration-300 ${
          isDark
            ? "bg-amber-600/20 border-amber-500/50 hover:bg-amber-500/30 text-amber-200 hover:text-amber-100 shadow-lg shadow-amber-500/20"
            : "bg-background/80 backdrop-blur-sm border-border/50 hover:bg-accent/50"
        }`}
      >
        {isDark ? (
          <>
            <Sun className="h-4 w-4 text-amber-400" />
            <span className="hidden sm:inline font-medium">Day Mode</span>
          </>
        ) : (
          <>
            <Moon className="h-4 w-4 text-slate-600" />
            <span className="hidden sm:inline font-medium">Night Mode</span>
          </>
        )}
      </Button>
    </div>
  )
}
