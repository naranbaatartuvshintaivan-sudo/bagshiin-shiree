"use client"

import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { cn } from "@/lib/utils"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const current = mounted ? theme : "light"

  return (
    <div
      role="radiogroup"
      aria-label="Харагдацын горим"
      className="inline-flex rounded-xl border border-[var(--border-soft)] bg-[var(--bg-paper)] p-1"
    >
      <button
        type="button"
        role="radio"
        aria-checked={current === "light"}
        onClick={() => setTheme("light")}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
          current === "light"
            ? "bg-primary text-white shadow-sm"
            : "text-[var(--text-muted)] hover:text-[var(--text-ink)]"
        )}
      >
        <Sun className="h-4 w-4" />
        Гэрэлтэй
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={current === "dark"}
        onClick={() => setTheme("dark")}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
          current === "dark"
            ? "bg-primary text-white shadow-sm"
            : "text-[var(--text-muted)] hover:text-[var(--text-ink)]"
        )}
      >
        <Moon className="h-4 w-4" />
        Харанхуй
      </button>
    </div>
  )
}
