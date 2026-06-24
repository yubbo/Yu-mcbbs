/**
 * 主题引擎 — src/core/theme/engine.ts
 *
 * 负责：
 *   1. 扫描 themes/ 目录发现主题
 *   2. 验证主题合法性（配置 + style.css）
 *   3. 加载主题配置
 *   4. 获取当前激活主题
 *   5. 三层降级模板查找
 *   6. 加载主题钩子（沙箱执行）
 */

import { readdirSync, readFileSync, existsSync } from "fs"
import path from "path"
import { loadThemeHooks, type ThemeHooks } from "./hooks"

export type { ThemeHooks }

export interface ThemeInfo {
  name: string
  path: string
  config: ThemeConfig
  valid: boolean
  reason?: string
}

export interface ThemeConfig {
  name: string
  version: string
  description?: string
  author?: string
  modules: string[]
  templates: Record<string, string>
  settings: Record<string, unknown>
  requires?: string[]
}

const THEMES_DIR = /*turbopackIgnore: true*/ path.join(process.cwd(), "themes")
const FALLBACK_DIR = /*turbopackIgnore: true*/ path.join(process.cwd(), "src", "templates", "default")

const THEME_CONFIG_PATTERN = /^default_.+_theme\.json$/

/** 扫描所有主题 */
export function scanThemes(): ThemeInfo[] {
  if (!existsSync(THEMES_DIR)) return []
  const entries = readdirSync(THEMES_DIR, { withFileTypes: true })
  const themes: ThemeInfo[] = []
  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    const themeDir = path.join(THEMES_DIR, entry.name)
    const info = validateTheme(entry.name, themeDir)
    themes.push(info)
  }
  return themes
}

function validateTheme(name: string, dir: string): ThemeInfo {
  const configFile = findConfigFile(dir)
  const styleFile = path.join(dir, "style.css")
  if (!configFile) {
    return { name, path: dir, config: {} as ThemeConfig, valid: false, reason: "缺少配置文件 default_*_theme.json" }
  }
  if (!existsSync(styleFile)) {
    return { name, path: dir, config: {} as ThemeConfig, valid: false, reason: "缺少身份验证文件 style.css" }
  }
  try {
    const raw = readFileSync(configFile, "utf-8")
    const config: ThemeConfig = JSON.parse(raw)
    const defaults: ThemeConfig = { name: "unknown", version: "0.0.0", modules: [], templates: {}, settings: {} }
    return { name, path: dir, config: { ...defaults, ...config }, valid: true }
  } catch (err) {
    return { name, path: dir, config: {} as ThemeConfig, valid: false, reason: `配置文件解析失败: ${err}` }
  }
}

function findConfigFile(dir: string): string | null {
  for (const file of readdirSync(dir)) {
    if (THEME_CONFIG_PATTERN.test(file)) return path.join(dir, file)
  }
  return null
}

export function getTheme(name: string): ThemeInfo | null {
  return scanThemes().find((t) => t.name === name && t.valid) || null
}

export function getDefaultTheme(): ThemeInfo | null {
  return getTheme("default")
}

/**
 * 查找模板文件路径（三层降级）
 * 1. 当前激活主题
 * 2. themes/default/
 * 3. src/templates/default/ (内核兜底)
 */
export function resolveTemplate(
  activeTheme: string | null | undefined,
  template: string
): string | null {
  const candidates: string[] = []
  if (activeTheme) candidates.push(path.join(THEMES_DIR, activeTheme, template))
  candidates.push(path.join(THEMES_DIR, "default", template))
  candidates.push(path.join(FALLBACK_DIR, template))
  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate
  }
  return null
}

export function loadTemplate(
  activeTheme: string | null | undefined,
  template: string
): string | null {
  const filePath = resolveTemplate(activeTheme, template)
  if (!filePath) return null
  return readFileSync(filePath, "utf-8")
}
