"use client"

import { useEffect, useState, useCallback } from "react"
import { usePathname } from "next/navigation"

interface Props {
  enabled: boolean
  defaultMode: string
  effectiveMode: string
  userToggle: boolean
}

const THEME_KEY = "bbs_cms_theme"

function apply(cls: "theme-dark" | "theme-light") {
  const h = document.documentElement
  if (cls === "theme-dark") {
    h.classList.add("dark", "theme-dark")
    h.classList.remove("theme-light")
  } else {
    h.classList.remove("dark", "theme-dark")
    h.classList.add("theme-light")
  }
}

function systemPrefersDark(): boolean {
  if (typeof window === "undefined") return false
  return window.matchMedia("(prefers-color-scheme: dark)").matches
}

export function ThemeInit({ enabled, defaultMode, effectiveMode, userToggle }: Props) {
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith("/admin") ?? false
  const isInstall = pathname?.startsWith("/install") ?? false

  const [current, setCurrent] = useState<"light" | "dark">(
    effectiveMode === "dark" ? "dark" : "light"
  )

  const activeMode = isAdmin ? defaultMode : effectiveMode

  useEffect(() => {
    if (!enabled) return

    if (isAdmin) {
      if (defaultMode === "system") {
        const sysDark = systemPrefersDark()
        apply(sysDark ? "theme-dark" : "theme-light")
        setCurrent(sysDark ? "dark" : "light")
      } else if (defaultMode === "dark") {
        apply("theme-dark")
        setCurrent("dark")
      } else {
        apply("theme-light")
        setCurrent("light")
      }
      return
    }

    const saved = tryReadLocal()
    if (saved && saved === effectiveMode) {
      apply(saved === "dark" ? "theme-dark" : "theme-light")
      setCurrent(saved as "light" | "dark")
      return
    }

    if (effectiveMode === "system") {
      const sysDark = systemPrefersDark()
      apply(sysDark ? "theme-dark" : "theme-light")
      setCurrent(sysDark ? "dark" : "light")
    } else if (effectiveMode === "dark") {
      apply("theme-dark")
      setCurrent("dark")
    } else {
      apply("theme-light")
      setCurrent("light")
    }
  }, [enabled, isAdmin, defaultMode, effectiveMode])

  useEffect(() => {
    if (!enabled || activeMode !== "system") return
    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    const listener = () => {
      const next = mq.matches ? "dark" : "light"
      apply(next === "dark" ? "theme-dark" : "theme-light")
      setCurrent(next)
    }
    listener()
    mq.addEventListener("change", listener)
    return () => mq.removeEventListener("change", listener)
  }, [enabled, activeMode])

  const toggle = useCallback(() => {
    const next = current === "dark" ? "light" : "dark"
    setCurrent(next)
    apply(next === "dark" ? "theme-dark" : "theme-light")
    try {
      localStorage.setItem(THEME_KEY, next)
      document.cookie = `${THEME_KEY}=${next};path=/;max-age=31536000;SameSite=Lax`
    } catch (_) {}
  }, [current])

  if (!enabled) return null

  return (
    <>
      {/* 三层级联 CSS: framework.css（layout.tsx 导入）→ 默认主题 → 激活主题 */}
      <link rel="stylesheet" href="/themes/default/theme.css" />

      {userToggle && !isAdmin && !isInstall && (
        <button
          onClick={toggle}
          suppressHydrationWarning
          aria-label={current === "dark" ? "切换浅色" : "切换深色"}
          className="fixed right-4 top-1/2 -translate-y-1/2 z-50 flex items-center justify-center size-10 rounded-full border shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-110 cursor-pointer"
          style={{
            right: "16px", left: "auto",
            borderColor: current === "dark" ? "#3b3b4d" : "#e5e7eb",
            background: current === "dark" ? "rgba(30,30,40,0.9)" : "rgba(255,255,255,0.9)",
            color: current === "dark" ? "#fbbf24" : "#f59e0b",
          }}
        >
          {current === "dark" ? (
            <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>
      )}
    </>
  )
}

function tryReadLocal(): string | null {
  try { return localStorage.getItem(THEME_KEY) } catch { return null }
}
