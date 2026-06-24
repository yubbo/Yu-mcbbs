"use client"

// app/(adminpanel)/layout.tsx — 管理端布局
// 左侧边栏 + 右侧内容区，仅 admin / super_admin 可访问

import { useEffect, useState, useCallback } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { getToken, getUserRole, removeToken } from "@/lib/auth"
import { UserAvatarMenu } from "@/components/user/UserAvatarMenu"

const navItems = [
  {
    label: "仪表盘",
    href: "/admin",
  },
  {
    label: "论坛管理",
    href: "/admin/bbs",
    children: [
      { type: "link" as const, label: "版块管理", href: "/admin/bbs/forums" },
      { type: "link" as const, label: "论坛设置", href: "/admin/bbs/settings" },
    ],
  },
  {
    label: "用户管理",
    href: "/admin/users",
    children: [
      { type: "link" as const, label: "用户列表", href: "/admin/users" },
      { type: "link" as const, label: "用户权限", href: "/admin/users/roles" },
    ],
  },
  {
    label: "插件",
    href: "/admin/plugins",
  },
  {
    label: "站点设置",
    href: "/admin/settings",
    children: [
      {
        type: "group" as const,
        label: "全局",
        href: "/admin/settings/global/site",
        children: [
          { type: "link" as const, label: "站点信息", href: "/admin/settings/global/site" },
          { type: "link" as const, label: "功能开关", href: "/admin/settings/global/features" },
        ],
      },
      {
        type: "group" as const,
        label: "界面",
        href: "/admin/settings/ui/layout",
        children: [
          { type: "link" as const, label: "导航管理", href: "/admin/settings/ui/navigation/main" },
          { type: "link" as const, label: "界面布局", href: "/admin/settings/ui/layout" },
        ],
      },
      {
        type: "group" as const,
        label: "主题",
        href: "/admin/settings/ui/theme",
        children: [
          { type: "link" as const, label: "主题模块", href: "/admin/settings/ui/theme/modules" },
          { type: "link" as const, label: "主题设置", href: "/admin/settings/ui/theme/config" },
        ],
      },
    ],
  },
]

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin"
  return pathname.startsWith(href)
}

const SIDEBAR_STORAGE_KEY = "admin_sidebar_expanded"

function loadSidebarState(): Record<string, boolean> {
  if (typeof window === "undefined") return {}
  try {
    const raw = localStorage.getItem(SIDEBAR_STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

function saveSidebarState(state: Record<string, boolean>) {
  try { localStorage.setItem(SIDEBAR_STORAGE_KEY, JSON.stringify(state)) } catch {}
}

export default function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [ready, setReady] = useState(false)
  const [expanded, setExpanded] = useState<Record<string, boolean>>(loadSidebarState)

  useEffect(() => {
    const token = getToken()
    if (!token) { router.replace("/login?redirect=admin"); return }
    const role = getUserRole(token)
    if (role !== "admin" && role !== "super_admin") { router.replace("/"); return }
    setReady(true)
  }, [router])

  // 路径变化时自动展开匹配的父级/分组，同时记住用户对其他项的选择
  useEffect(() => {
    setExpanded((prev) => {
      const next: Record<string, boolean> = { ...prev }
      navItems.forEach((item) => {
        if (item.children && isActive(pathname, item.href)) {
          next[item.href] = true
          // 子分组：当前路径命中即展开
          item.children.forEach((child) => {
            if (child.type === "group" && child.children?.some(c => pathname === c.href)) {
              next[child.href] = true
            }
          })
        }
      })
      saveSidebarState(next)
      return next
    })
  }, [pathname])

  const toggleExpand = useCallback((href: string) => {
    setExpanded((prev) => {
      const next = { ...prev, [href]: !prev[href] }
      saveSidebarState(next)
      return next
    })
  }, [])

  if (!ready) return null

  const handleLogout = () => { removeToken(); router.replace("/login") }

  return (
    <div className="min-h-screen flex bg-zinc-50">
      {/* 左侧边栏 */}
      <aside className="w-56 bg-white border-r border-zinc-200 flex flex-col shrink-0">
        <div className="px-5 py-4 border-b border-zinc-100">
          <Link href="/" className="font-bold text-base text-zinc-900 no-underline">
            BBS CMS
          </Link>
          <span className="block text-xs text-zinc-400 mt-0.5">管理后台</span>
        </div>

        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const hasChildren = !!item.children
            const isItemActive = isActive(pathname, item.href)
            const isExpanded = expanded[item.href] || false

            return (
              <div key={item.href}>
                {/* 父级菜单项 */}
                {hasChildren ? (
                  <button
                    onClick={() => toggleExpand(item.href)}
                    className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer border-none font-inherit ${
                      isItemActive
                        ? "bg-zinc-900 text-white"
                        : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                    }`}
                  >
                    <span>{item.label}</span>
                    <svg
                      className={`size-3.5 shrink-0 transition-transform duration-200 ${
                        isExpanded ? "rotate-90" : "rotate-0"
                      }`}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm no-underline transition-colors ${
                      isItemActive
                        ? "bg-zinc-900 text-white"
                        : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                    }`}
                  >
                    {item.label}
                  </Link>
                )}

                {/* 子菜单抽屉 */}
                {hasChildren && isExpanded && (
                  <div className="ml-3 mt-0.5 space-y-0.5">
                    {item.children!.map((child) => {
                      if (child.type === "group") {
                        const groupExpanded = expanded[child.href] || false
                        return (
                          <div key={child.href}>
                            <button
                              onClick={() => toggleExpand(child.href)}
                              className="flex items-center justify-between w-full px-3 py-1 rounded-md text-xs text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer border-none bg-transparent"
                            >
                              <span>{child.label}</span>
                              <svg
                                className={`size-3 shrink-0 transition-transform duration-200 ${
                                  groupExpanded ? "rotate-90" : "rotate-0"
                                }`}
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <polyline points="9 18 15 12 9 6" />
                              </svg>
                            </button>
                            {groupExpanded && child.children && (
                              <div className="ml-2 mt-0.5 space-y-0.5">
                                {child.children.map((sub) => (
                                  <Link
                                    key={sub.href}
                                    href={sub.href}
                                    className={`block px-3 py-1.5 rounded-md text-xs no-underline transition-colors ${
                                      pathname === sub.href
                                        ? "bg-zinc-100 text-zinc-900 font-medium"
                                        : "text-zinc-500 hover:text-zinc-700"
                                    }`}
                                  >
                                    {sub.label}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        )
                      }
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`block px-3 py-1.5 rounded-md text-xs no-underline transition-colors ${
                            pathname === child.href
                              ? "bg-zinc-100 text-zinc-900 font-medium"
                              : "text-zinc-500 hover:text-zinc-700"
                          }`}
                        >
                          {child.label}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        <div className="px-5 py-3 border-t border-zinc-100">
          <button
            onClick={handleLogout}
            className="text-xs text-zinc-400 hover:text-red-500 transition-colors cursor-pointer bg-transparent border-none p-0"
          >
            退出登录
          </button>
        </div>
      </aside>

      {/* 右侧内容 */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-12 border-b border-zinc-200 bg-white flex items-center justify-between px-6 shrink-0">
          <span className="text-xs text-zinc-400">管理端</span>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xs text-zinc-400 hover:text-zinc-600 no-underline">
              返回前台
            </Link>
            <UserAvatarMenu />
          </div>
        </header>
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-5xl">{children}</div>
        </main>
      </div>
    </div>
  )
}
