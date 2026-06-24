"use client"

// app/(userpanel)/user/settings/_components/SettingsTabs.tsx
// 账号设置左侧 Tab 导航 — 使用 usePathname 高亮当前路由

import { usePathname } from "next/navigation"
import Link from "next/link"

const TABS = [
  { href: "/user/settings/avatar", label: "修改头像", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
  { href: "/user/settings/profile", label: "个人资料", icon: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" },
  { href: "/user/settings/points", label: "积分", icon: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" },
  { href: "/user/settings/privacy", label: "隐私筛选", icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" },
  { href: "/user/settings/password", label: "密码安全", icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" },
  { href: "/user/settings/deactivate", label: "账号注销", icon: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" },
]

export function SettingsTabs() {
  const pathname = usePathname()

  return (
    <nav className="flex sm:flex-col gap-1 overflow-x-auto sm:overflow-visible pb-1 sm:pb-0 sm:w-40 lg:w-44 shrink-0">
      {TABS.map((tab) => {
        const active = pathname === tab.href
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex items-center gap-2 sm:gap-2.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm no-underline transition-all duration-200 whitespace-nowrap sm:whitespace-normal ${
              active
                ? "bg-zinc-100 text-zinc-900 font-medium shadow-sm"
                : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700"
            }`}
          >
            <svg className="size-3.5 sm:size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d={tab.icon} />
            </svg>
            <span>{tab.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
