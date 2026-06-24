"use client"

// app/(userpanel)/_components/UserSidebar.tsx
// 用户中心侧边栏 — 显示用户概览 + 分组导航菜单

import { usePathname } from "next/navigation"
import Link from "next/link"
import { ROLE_LABELS } from "@/lib/constants"

const MENU = [
  { href: "/user", key: "", label: "控制台", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6", group: "管理", countKey: null as string | null },
  { href: "/user/articles", key: "articles", label: "我的文章", icon: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z", group: "内容", countKey: "articles" },
  { href: "/user/posts", key: "posts", label: "我的帖子", icon: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z", group: "内容", countKey: "posts" },
  { href: "/user/drafts", key: "drafts", label: "草稿箱", icon: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7", group: "内容", countKey: "drafts" },
  { href: "/user/comments", key: "comments", label: "我的评论", icon: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z", group: "内容", countKey: "comments" },
  { href: "/user/favorites", key: "favorites", label: "收藏夹", icon: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z", group: "更多", countKey: "favorites" },
  { href: "/user/notifications", key: "notifications", label: "通知中心", icon: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9", group: "更多", countKey: "notifications" },
  { href: "/user/settings", key: "settings", label: "账号设置", icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z", group: "更多", countKey: null },
]

export interface UserSidebarProps {
  username: string
  email: string
  avatar: string
  role: string
  onLogout: () => void
}

export function UserSidebar({ username, email, avatar, role, onLogout }: UserSidebarProps) {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === "/user") return pathname === "/user"
    return pathname.startsWith(href)
  }

  const grouped = MENU.reduce((acc, item) => {
    if (!acc[item.group]) acc[item.group] = []
    acc[item.group].push(item)
    return acc
  }, {} as Record<string, typeof MENU>)

  return (
    <aside className="w-full lg:w-52 xl:w-56 shrink-0">
      <div className="rounded-xl sm:rounded-2xl border border-zinc-200/80 bg-white overflow-hidden shadow-sm">
        {/* 用户概览卡片 */}
        <div className="p-4 sm:p-5 border-b border-zinc-100">
          <div className="flex items-center gap-2.5 sm:gap-3">
            {avatar ? (
              <img src={avatar} alt={username} className="size-9 sm:size-11 rounded-full border-2 border-white shadow-sm object-cover ring-1 ring-zinc-200" />
            ) : (
              <div className="flex items-center justify-center size-9 sm:size-11 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs sm:text-sm font-bold shadow-sm">
                {username.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-semibold text-zinc-800 truncate">{username}</p>
              <p className="text-[10px] sm:text-xs text-zinc-400 truncate">{email}</p>
            </div>
          </div>
          <div className="mt-2.5 sm:mt-3 flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <span className="text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 border border-zinc-200 font-medium whitespace-nowrap">
              {ROLE_LABELS[role] || "用户"}
            </span>
          </div>
        </div>

        {/* 导航菜单 */}
        <div className="p-1.5 sm:p-2">
          {Object.entries(grouped).map(([group, items]) => (
            <div key={group} className="mb-2 sm:mb-3">
              <p className="px-2 sm:px-3 py-1 sm:py-1.5 text-[9px] sm:text-[10px] font-medium text-zinc-400 uppercase tracking-wider">
                {group}
              </p>
              <div className="space-y-0.5">
                {items.map((item) => (
                  <Link
                    key={item.key || item.href}
                    href={item.href}
                    className={`flex items-center gap-2 sm:gap-2.5 w-full rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm transition-all duration-200 ${
                      isActive(item.href)
                        ? "bg-zinc-100 text-zinc-900 font-medium"
                        : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-800"
                    } no-underline`}
                  >
                    <svg className="size-3.5 sm:size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d={item.icon} />
                    </svg>
                    <span className="truncate flex-1">{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* 返回链接 */}
        <div className="p-1.5 sm:p-2 border-t border-zinc-100">
          <Link href="/" className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs text-zinc-400 hover:text-zinc-600 transition-colors no-underline">
            <svg className="size-3 sm:size-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <span className="truncate">返回网站首页</span>
          </Link>
        </div>

        {/* 退出登录 */}
        <div className="p-1.5 sm:p-2 border-t border-zinc-100">
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 sm:gap-2 w-full px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs text-zinc-400 hover:text-red-500 transition-colors cursor-pointer bg-transparent border-none"
          >
            <svg className="size-3 sm:size-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <span className="truncate">退出登录</span>
          </button>
        </div>
      </div>
    </aside>
  )
}
