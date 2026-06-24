/**
 * 主题钩子加载器 — src/core/theme/hooks.ts
 *
 * 扫描主题的 hooks/ 目录，在受限环境中执行钩子。
 * 钩子通过 ThemeHooks API 与框架交互，不能直接访问数据库或文件系统。
 *
 * 安全警告：
 *   require() 可执行任意 Node.js 代码。主题钩子仅限管理员上传的主题使用。
 *   生产环境建议引入 isolated-vm 沙箱隔离。
 */

import { readdirSync, existsSync } from "fs"
import path from "path"

const THEMES_DIR = path.join(process.cwd(), "themes")

export interface ThemeHooks {
  registerSetting(key: string, defaultValue: string | number | boolean, type: "string" | "number" | "boolean" | "select" | "color"): void
  getSetting(key: string): string | number | boolean | null
  addStyle(href: string): void
  addScript(src: string): void
  onLoad(callback: () => Promise<void>): void
  fetch(url: string, options?: Record<string, unknown>): Promise<Response>
}

interface HookModule {
  default?: (hooks: ThemeHooks) => void | Promise<void>
  init?: (hooks: ThemeHooks) => void | Promise<void>
}

interface HookResult {
  module: string
  settings: Map<string, { defaultValue: unknown; type: string }>
  styles: string[]
  scripts: string[]
}

export async function loadThemeHooks(themePath: string): Promise<HookResult[]> {
  const hooksDir = path.join(themePath, "hooks")
  if (!existsSync(hooksDir)) return []
  const subDirs = readdirSync(hooksDir, { withFileTypes: true })
  const results: HookResult[] = []
  for (const dir of subDirs) {
    if (!dir.isDirectory()) continue
    const initFile = path.join(hooksDir, dir.name, "init.ts")
    const initFileJs = path.join(hooksDir, dir.name, "init.js")
    const file = existsSync(initFile) ? initFile : existsSync(initFileJs) ? initFileJs : null
    if (!file) continue
    try {
      const result = await executeHook(file, dir.name)
      results.push(result)
    } catch (err) {
      console.error(`[theme] 钩子加载失败 ${dir.name}: ${err}`)
    }
  }
  return results
}

async function executeHook(filePath: string, moduleName: string): Promise<HookResult> {
  // 路径安全：确保 hook 文件在 themes/ 目录内
  const resolvedHookPath = path.resolve(filePath)
  const resolvedThemesDir = path.resolve(THEMES_DIR)
  if (!resolvedHookPath.startsWith(resolvedThemesDir + path.sep)) {
    throw new Error(`Hook 路径不在 themes 目录内: ${filePath}`)
  }

  const settings = new Map<string, { defaultValue: unknown; type: string }>()
  const styles: string[] = []
  const scripts: string[] = []
  const loadCallbacks: Array<() => Promise<void>> = []

  const hooks: ThemeHooks = {
    registerSetting(key, defaultValue, type) { settings.set(key, { defaultValue, type }) },
    getSetting(key) { const s = settings.get(key); return s ? (s.defaultValue as string | number | boolean) : null },
    addStyle(href) { styles.push(href) },
    addScript(src) { scripts.push(src) },
    onLoad(callback) { loadCallbacks.push(callback) },
    async fetch(url, options) {
      const allowed = ["api.github.com", "cdn.jsdelivr.net"]
      try {
        const parsed = new URL(url)
        if (!allowed.includes(parsed.hostname)) throw new Error(`域名 ${parsed.hostname} 不在白名单中`)
        return fetch(url, options)
      } catch (err) {
        console.error(`[theme] fetch 被拒绝: ${url}`)
        throw err
      }
    },
  }

  const mod: HookModule = require(/*turbopackIgnore: true*/ filePath)
  const initFn = mod.default || mod.init
  if (typeof initFn === "function") initFn(hooks)
  for (const cb of loadCallbacks) { await cb() }
  return { module: moduleName, settings, styles, scripts }
}
