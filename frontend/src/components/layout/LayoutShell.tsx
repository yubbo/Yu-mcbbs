"use client"

// components/LayoutShell.tsx — 布局外壳
// 客户端组件，通过 usePathname 判断当前路由，
// 非 /admin 路径渲染公共 Header/Footer
// 读取 layout_mode 设置并应用到 <html> 标签

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { PublicHeader } from "@/components/layout/PublicHeader"
import { PublicFooter } from "@/components/layout/PublicFooter"

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith("/admin")
  const isInstall = pathname.startsWith("/install")

  // 读取 layout_mode 设置（公开接口，无需认证）
  useEffect(() => {
    fetch("/api/v1/settings/public/layout_mode")
      .then((res) => res.json())
      .then((json) => {
        if (json?.data?.value) {
          document.documentElement.setAttribute("data-layout-mode", json.data.value)
        }
      })
      .catch(() => {})
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      {!isAdmin && !isInstall && <PublicHeader />}
      <main className="flex-1">{children}</main>
      {!isAdmin && !isInstall && <PublicFooter />}
    </div>
  )
}
