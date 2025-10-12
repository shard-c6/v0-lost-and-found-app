"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

export function ThemeToggle({ onIcon, offIcon }: { onIcon?: React.ReactNode; offIcon?: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("theme")
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
    const shouldDark = saved ? saved === "dark" : prefersDark
    setIsDark(shouldDark)
    document.documentElement.classList.toggle("dark", shouldDark)
  }, [])

  const toggle = () => {
    const next = !isDark
    setIsDark(next)
    document.documentElement.classList.toggle("dark", next)
    localStorage.setItem("theme", next ? "dark" : "light")
  }

  return (
    <Button variant="outline" size="icon" aria-label="Toggle theme" onClick={toggle}>
      <span className="sr-only">Toggle theme</span>
      {isDark ? onIcon : offIcon}
    </Button>
  )
}
