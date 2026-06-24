// core/lang/index.tsx — 语言包加载与翻译系统
//
// 语言包存放位置：
//   public/lang/{code}.json  — 核心语言包（zh-CN, en...）
//
// 主题新增/覆盖语言：
//   在 public/themes/{theme}/lang/ 下放置同名 JSON 文件即可。
//   加载时优先取主题语言包，缺失 key 回退到核心包。
//
// 使用方式：
//   const { t, setLang, currentLang } = useLang()
//   <p>{t("install.welcome_title")}</p>
//   <p>{t("install.license_countdown", { s: 5 })}</p>

"use client"

import { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from "react"

// ── 类型 ──

export interface LangPack {
  lang: { name: string; code: string; flag: string }
  [section: string]: Record<string, string> | LangPack["lang"]
}

export interface LangMeta {
  code: string
  name: string
  flag: string
}

// ── 常量 ──

const STORAGE_KEY = "bbs_cms_lang"
const DEFAULT_LANG = "zh-CN"

export const BUILTIN_LANGS: LangMeta[] = [
  { code: "zh-CN", name: "简体中文", flag: "🇨🇳" },
  { code: "en", name: "English", flag: "🇺🇸" },
]

// ── Context ──

interface LangContextValue {
  t: (key: string, vars?: Record<string, string | number>) => string
  currentLang: string
  setLang: (code: string) => void
  availableLangs: LangMeta[]
}

const LangContext = createContext<LangContextValue>({
  t: (key) => key,
  currentLang: DEFAULT_LANG,
  setLang: () => {},
  availableLangs: BUILTIN_LANGS,
})

// ── Provider ──

export function LangProvider({
  children,
  theme,
}: {
  children: ReactNode
  theme?: string // 当前主题名，用于加载主题语言包
}) {
  const [currentLang, setCurrentLangState] = useState(DEFAULT_LANG)
  const [packs, setPacks] = useState<Record<string, LangPack>>({})
  const [loaded, setLoaded] = useState(false)

  // 初始化：从 localStorage 读取语言偏好
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) setCurrentLangState(stored)
  }, [])

  // 加载语言包
  useEffect(() => {
    if (!currentLang) return

    const loadLang = async () => {
      const pack: Partial<LangPack> = {}

      // 1) 加载核心语言包
      try {
        const res = await fetch(`/lang/${currentLang}.json`)
        if (res.ok) {
          const json = await res.json()
          Object.assign(pack, json)
        }
      } catch {
        /* fallback below */
      }

      // 2) 加载主题语言包覆盖（如果提供了 theme）
      if (theme) {
        try {
          const res = await fetch(`/themes/${theme}/lang/${currentLang}.json`)
          if (res.ok) {
            const json = await res.json()
            deepMerge(pack as LangPack, json)
          }
        } catch {
          /* optional */
        }
      }

      // 3) 兜底：zh-CN
      if (!pack.lang && currentLang !== DEFAULT_LANG) {
        try {
          const res = await fetch(`/lang/${DEFAULT_LANG}.json`)
          if (res.ok) {
            const json = await res.json()
            Object.assign(pack, json)
          }
        } catch {}
      }

      setPacks((prev) => ({ ...prev, [currentLang]: pack as LangPack }))
      setLoaded(true)
    }

    if (packs[currentLang]) {
      setLoaded(true)
      return
    }

    loadLang()
  }, [currentLang, theme])

  const setLang = useCallback((code: string) => {
    setCurrentLangState(code)
    localStorage.setItem(STORAGE_KEY, code)
  }, [])

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>): string => {
      const pack = packs[currentLang]
      if (!pack) return key

      const keys = key.split(".")
      let val: unknown = pack
      for (const k of keys) {
        if (typeof val === "object" && val !== null && k in val) {
          val = (val as Record<string, unknown>)[k]
        } else {
          return key
        }
      }

      if (typeof val !== "string") return key

      if (vars) {
        return val.replace(/\{(\w+)\}/g, (_, name) =>
          name in vars ? String(vars[name]) : `{${name}}`
        )
      }
      return val
    },
    [currentLang, packs]
  )

  return (
    <LangContext.Provider value={{ t, currentLang, setLang, availableLangs: BUILTIN_LANGS }}>
      {loaded ? children : null}
    </LangContext.Provider>
  )
}

// ── Hook ──

export function useLang() {
  return useContext(LangContext)
}

// ── 工具 ──

function deepMerge(target: Record<string, unknown>, source: Record<string, unknown>) {
  for (const key of Object.keys(source)) {
    if (
      typeof source[key] === "object" &&
      source[key] !== null &&
      !Array.isArray(source[key]) &&
      typeof target[key] === "object" &&
      target[key] !== null &&
      !Array.isArray(target[key])
    ) {
      deepMerge(target[key] as Record<string, unknown>, source[key] as Record<string, unknown>)
    } else {
      target[key] = source[key]
    }
  }
}
