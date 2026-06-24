// src/core/theme/index.ts — 主题系统统一导出
export { scanThemes, getTheme, getDefaultTheme, resolveTemplate, loadTemplate } from "./engine"
export type { ThemeInfo, ThemeConfig } from "./engine"
export { render, renderFile } from "./render"
export { loadThemeHooks } from "./hooks"
export type { ThemeHooks } from "./hooks"
export { getFrameworkDefaults } from "./defaults"
export type { NavLink } from "./defaults"
