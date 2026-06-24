// app/layout.tsx — 根布局
// 对应 Go 后端文件: cmd/server/main.go + internal/router/router.go
//
// 所有页面共享的外壳：HTML 结构、全局样式、元数据、主题系统。
// 深色模式默认启用，用户可手动切换。

import type { Metadata } from "next"
import { cookies } from "next/headers"
import "./globals.css"
import "@/core/theme/framework.css"
import { ThemeInit } from "@/components/theme/ThemeInit"
import { LayoutShell } from "@/components/layout/LayoutShell"
import { Toaster } from "@/components/ui/sonner"

export const metadata: Metadata = {
  title: "BBS CMS",
  description: "论坛 BBS + 博客 CMS 一体化平台",
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // 深色模式配置（骨架阶段硬编码，生产环境从 settings 表读取）
  const darkModeEnabled = true
  const darkModeDefault = "light" // light | dark | system
  const userToggle = true

  // Cookie 优先于默认值
  const cookieStore = await cookies()
  const cookieTheme = cookieStore.get("bbs_cms_theme")?.value
  const effectiveMode =
    cookieTheme === "light" || cookieTheme === "dark" ? cookieTheme : darkModeDefault

  // 服务端读取全站背景图，注入 CSS 变量消除刷新闪白
  const bgImage = await fetch("http://127.0.0.1:8080/api/v1/settings/public/site_bg_image")
    .then(r => r.json())
    .then(d => (d?.data?.value as string) || "")
    .catch(() => "")

  // 计算 HTML class
  let htmlClass = "h-full antialiased"
  if (darkModeEnabled) {
    htmlClass += effectiveMode === "dark" ? " dark theme-dark" : " theme-light"
  } else {
    htmlClass += " theme-light"
  }

  return (
    <html lang="zh-CN" className={htmlClass} suppressHydrationWarning>
      <head>
        {bgImage && (
          <style>{`body::before{--site-bg-image:url(${bgImage})}`}</style>
        )}
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeInit
          enabled={darkModeEnabled}
          defaultMode={darkModeDefault}
          effectiveMode={effectiveMode}
          userToggle={userToggle}
        />
        <LayoutShell>{children}</LayoutShell>
        <Toaster />
      </body>
    </html>
  )
}
