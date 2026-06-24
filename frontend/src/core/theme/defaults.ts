/**
 * 框架默认数据 — src/core/theme/defaults.ts
 *
 * 主题开发者写 {SITE_NAME}、{SITE_URL} 等常量，框架自动注入。
 * 生产环境从 settings 表读取后覆盖此默认值。
 */

export function getFrameworkDefaults(): Record<string, string> {
  return {
    site_name: "BBS CMS",
    site_url: "",
    site_description: "论坛 BBS + 博客 CMS 一体化平台",
    current_year: new Date().getFullYear().toString(),
  }
}

export interface NavLink {
  label: string
  href: string
  icon: string
}
