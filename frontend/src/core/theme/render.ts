/**
 * 模板渲染引擎 — src/core/theme/render.ts
 *
 * 解析模板文件，支持以下语法：
 *   {$variable}               → 变量替换
 *   {CONSTANT_NAME}            → 全局常量替换
 *   {themes path.html}        → 引入子模板（三层降级查找）
 *   {include path.html}       → 兼容旧语法，同 {themes}
 *   {subthemes name}          → 简写引入，等价 {themes common/{name}/{name}.html}
 *   {cell path}               → 细胞模板最小单元（加载 cell/path.htm）
 *   {cells path}              → 细胞模板聚合容器（加载 cell/path.htm，可包含多个 {cell}）
 *   {loop $array $item}...{/loop} → 循环
 *   {if $condition}...{/if}   → 条件渲染
 *   {* comment *}             → 模板注释（静默移除）
 *
 * 编译顺序（模拟编译期 vs 运行时差异）：
 *   注释 → subthemes → cells → themes → 循环 → 条件 → 变量
 *
 * 数据优先级（高到低）：页面 data → 主题 setup → 框架 defaults
 * 模板查找优先级（高到低）：激活主题 → 默认主题 → 内核兜底
 */

import { readFileSync, existsSync } from "fs"
import path from "path"
import { getFrameworkDefaults } from "./defaults"

type TemplateData = Record<string, unknown>

/**
 * 渲染模板字符串
 * @param template   模板内容
 * @param data       页面传入数据（优先级最高）
 * @param themeName  可选：当前激活主题名，用于加载 setup 自定义变量
 */
export function render(
  template: string,
  data: TemplateData = {},
  themeName?: string
): string {
  const themeData = themeName ? loadThemeSetupData(themeName) : {}
  const merged = { ...getFrameworkDefaults(), ...themeData, ...data }
  let result = template

  result = processComments(result)
  result = processSubthemes(result, themeName) // 编译期内嵌
  result = processCells(result, themeName)     // 细胞模板：{cell} {cells} 编译期内嵌
  result = processThemes(result, themeName)    // 运行时包含，支持 {if} 条件加载
  result = processLoops(result, merged)
  result = processIfs(result, merged)
  result = replaceVariables(result, merged)

  return result
}

function loadThemeSetupData(themeName: string): Record<string, unknown> {
  // 路径安全：themeName 不能包含路径穿越字符
  if (themeName.includes("..") || themeName.includes("/") || themeName.includes("\\")) {
    console.warn(`[theme] 非法的 themeName: ${themeName}`)
    return {}
  }
  const themesDir = /*turbopackIgnore: true*/ path.join(process.cwd(), "themes")
  const themeDir = path.join(themesDir, themeName)
  // 确保解析后的路径仍在 themesDir 内
  if (!path.resolve(themeDir).startsWith(path.resolve(themesDir) + path.sep)) {
    console.warn(`[theme] 路径不在 themes 内: ${themeDir}`)
    return {}
  }
  const candidates = [
    path.join(themeDir, "setup", "index.ts"),
    path.join(themeDir, "setup", "index.js"),
    path.join(themeDir, "setup.ts"),
    path.join(themeDir, "setup.js"),
  ]
  for (const filePath of candidates) {
    if (existsSync(filePath)) {
      try {
        const mod = require(/*turbopackIgnore: true*/ filePath)
        if (typeof mod.getTemplateData === "function") return mod.getTemplateData()
      } catch (err) {
        console.warn(`[theme] setup 加载失败: ${filePath}`, err)
      }
    }
  }
  return {}
}

export function renderFile(filePath: string, data: TemplateData = {}): string {
  if (!existsSync(filePath)) return `<!-- 模板不存在: ${filePath} -->`
  return render(readFileSync(filePath, "utf-8"), data)
}

function processComments(template: string): string {
  return template.replace(/\{\*[\s\S]*?\*\}/g, "")
}

// =========================================================================
// {themes path.html} / {include path.html} — 完整路径模板引入
// =========================================================================

function processThemes(template: string, themeName?: string): string {
  return template.replace(/\{(?:themes|include)\s+([^}]+)\}/g,
    (_match, includePath: string) => {
      const trimmed = includePath.trim()
      return resolveAndRead(trimmed, themeName) || `<!-- themes not found: ${trimmed} -->`
    })
}

// =========================================================================
// {subthemes name} — 简写引入，等价 {themes common/{name}/{name}.html}
// =========================================================================

function processSubthemes(template: string, themeName?: string): string {
  return template.replace(/\{subthemes\s+([^}]+)\}/g, (_match, name: string) => {
    const key = name.trim()
    const tplPath = `common/${key}/${key}.html`
    return resolveAndRead(tplPath, themeName) || `<!-- subthemes not found: ${key} -->`
  })
}

// =========================================================================
// {cell path} / {cells path} — 细胞模板
// {cell common/header/meta}  → cell/common/header/meta.html
// {cells common/header}      → cells/common/header.html（聚合容器，可包含子 {cell}）
// =========================================================================

function processCells(template: string, themeName?: string): string {
  return template.replace(/\{(cells?)\s+([^}]+)\}/g, (_match, tag: string, cellPath: string) => {
    const trimmed = cellPath.trim()
    const dir = tag === "cells" ? "cells" : "cell"
    const filePath = `${dir}/${trimmed}.html`
    return resolveAndRead(filePath, themeName) || `<!-- ${tag} not found: ${trimmed} -->`
  })
}

// =========================================================================
// 三层目录查找并读取文件
// =========================================================================

function resolveAndRead(relativePath: string, themeName?: string): string | null {
  // 路径安全：relativePath 不能穿越 themes 目录
  if (relativePath.includes("..")) {
    return null
  }
  const cwd = process.cwd()
  const themesDir = path.join(cwd, "themes")
  const fallbackDir = path.join(cwd, "src", "templates", "default")

  const candidates: (string | null)[] = []
  if (themeName && !themeName.includes("..") && !themeName.includes("/") && !themeName.includes("\\")) {
    const candidate = path.join(themesDir, themeName, relativePath)
    if (path.resolve(candidate).startsWith(path.resolve(themesDir) + path.sep)) {
      candidates.push(candidate)
    }
  }
  candidates.push(path.join(themesDir, "default", relativePath))
  candidates.push(path.join(fallbackDir, relativePath))

  for (const filePath of candidates) {
    if (filePath && existsSync(filePath)) return readFileSync(filePath, "utf-8")
  }
  return null
}

// =========================================================================
// 循环处理
// =========================================================================

function processLoops(template: string, data: TemplateData): string {
  let result = template
  let changed = true
  while (changed) {
    changed = false
    const next = processOneLoop(result, data)
    if (next !== result) { result = next; changed = true }
  }
  return result
}

function processOneLoop(template: string, data: TemplateData): string {
  const re = /\{loop\s+\$([\w.]+)\s+\$(\w+)\}/g
  let match: RegExpExecArray | null
  while ((match = re.exec(template)) !== null) {
    const startIdx = match.index
    const arrayKey = match[1]
    const itemKey = match[2]
    let depth = 1
    let i = startIdx + match[0].length
    while (i < template.length) {
      if (template.startsWith("{loop ", i)) depth++
      else if (template.startsWith("{/loop}", i)) { depth--; if (depth === 0) break }
      i++
    }
    if (depth !== 0) continue
    const endIdx = i + 7
    const body = template.slice(startIdx + match[0].length, i)
    const array = resolveNestedValue(data, arrayKey)
    if (!Array.isArray(array)) return template.slice(0, startIdx) + template.slice(endIdx)
    const replacement = array.map((item) => {
      let itemResult = body
      if (typeof item === "object" && item !== null) {
        const itemRecord = item as Record<string, unknown>
        itemResult = itemResult.replace(/\{\$(\w+)\.(\w+)\}/g,
          (_m: string, varName: string, prop: string) => {
            if (varName === itemKey) { const val = itemRecord[prop]; return val != null ? String(val) : "" }
            return _m
          })
        itemResult = processIfs(itemResult, { ...data, [itemKey]: itemRecord })
        itemResult = processLoops(itemResult, { ...data, [itemKey]: itemRecord })
      } else {
        itemResult = replaceVariables(itemResult, { ...data, [itemKey]: item })
      }
      return itemResult
    }).join("")
    return template.slice(0, startIdx) + replacement + template.slice(endIdx)
  }
  return template
}

// =========================================================================
// 条件渲染
// =========================================================================

function processIfs(template: string, data: TemplateData): string {
  let result = template
  while (true) {
    const pos = findOutermostIf(result)
    if (!pos) break
    const condition = evaluateExpression(data, pos.expr)
    const body = condition ? pos.trueBody : pos.falseBody
    const processed = processIfs(body, data)
    result = result.slice(0, pos.start) + processed + result.slice(pos.end + 5)
  }
  return result
}

function findOutermostIf(template: string): {
  start: number; end: number; expr: string; trueBody: string; falseBody: string
} | null {
  const tagRe = /\{if\s+(!?)\$([^}]+)\}/g
  let tagMatch: RegExpExecArray | null
  while ((tagMatch = tagRe.exec(template)) !== null) {
    const before = template.slice(0, tagMatch.index)
    const openCount = (before.match(/\{if\s/g) || []).length
    const closeCount = (before.match(/\{\/if\}/g) || []).length
    if (openCount !== closeCount) continue
    const start = tagMatch.index
    const negate = tagMatch[1]
    const rawExpr = tagMatch[2].trim()
    const expr = negate ? `!${rawExpr}` : rawExpr
    const bodyStart = start + tagMatch[0].length
    let depth = 1
    let elseAt = -1
    let i = bodyStart
    while (i < template.length) {
      if (template.startsWith("{if ", i)) depth++
      else if (template.startsWith("{/if}", i)) {
        depth--
        if (depth === 0) {
          const trueBody = elseAt >= 0 ? template.slice(bodyStart, elseAt) : template.slice(bodyStart, i)
          const falseBody = elseAt >= 0 ? template.slice(elseAt + 6, i) : ""
          return { start, end: i, expr, trueBody, falseBody }
        }
      } else if (depth === 1 && template.startsWith("{else}", i)) {
        elseAt = i
      }
      i++
    }
    return null
  }
  return null
}

function evaluateExpression(data: TemplateData, expr: string): boolean {
  if (expr.startsWith("!")) {
    const value = resolveNestedValue(data, expr.slice(1).trim())
    return !value
  }
  const compareMatch = expr.match(/^([\w.]+)\s*(===?|!==?|>=?|<=?)\s*(.+)$/)
  if (compareMatch) {
    const [, path, op, rawVal] = compareMatch
    const left = resolveNestedValue(data, path)
    let right: unknown = rawVal.trim()
    if (/^-?\d+$/.test(right as string)) right = Number(right)
    else if (/^["'].*["']$/.test(right as string)) right = (right as string).slice(1, -1)
    switch (op) {
      case "===": case "==": return left === right
      case "!==": case "!=": return left !== right
      case ">=": return Number(left) >= Number(right)
      case "<=": return Number(left) <= Number(right)
      case ">":  return Number(left) > Number(right)
      case "<":  return Number(left) < Number(right)
      default: return false
    }
  }
  const value = resolveNestedValue(data, expr)
  if (value === "false" || value === "0") return false
  return !!value
}

// =========================================================================
// 变量替换
// =========================================================================

const HTML_ESCAPE_MAP: Record<string, string> = {
  "&": "&amp;", "<": "&lt;", ">": "&gt;",
  '"': "&quot;", "'": "&#39;",
}

function escapeHtml(str: string): string {
  return str.replace(/[&<>"']/g, (c) => HTML_ESCAPE_MAP[c] || c)
}

function replaceVariables(template: string, data: TemplateData): string {
  template = template.replace(/\{\$([\w.]+)\}/g, (_match, key: string) => {
    const value = resolveNestedValue(data, key)
    if (value == null) return `<!-- {$key} -->`
    return escapeHtml(String(value))
  })
  template = template.replace(/\{([A-Z_][A-Z_\d]*)\}/g, (_match, key: string) => {
    const value = data[key.toLowerCase()]
    if (value == null) return ""
    return String(value)
  })
  return template
}

function resolveNestedValue(data: TemplateData, key: string): unknown {
  const parts = key.split(".")
  let value: unknown = data
  for (const part of parts) {
    if (value == null || typeof value !== "object") return undefined
    value = (value as Record<string, unknown>)[part]
  }
  return value
}
