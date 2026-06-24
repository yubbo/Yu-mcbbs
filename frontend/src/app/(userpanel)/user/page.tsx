"use client"

// app/(userpanel)/user/page.tsx — 控制台仪表盘
// 欢迎横幅 + 统计卡片 + 快捷入口 + 账号信息 + 权限概览

import { useEffect, useState } from "react"
import Link from "next/link"
import { getToken } from "@/lib/auth"
import { ROLE_LABELS } from "@/lib/constants"
import { parseJwtPayload } from "@/lib/hooks/useJwtPayload"
import { StatCard } from "@/modules/userpanel/shared/StatCard"
import { InfoRow } from "@/modules/userpanel/shared/InfoRow"

const QUICK_ENTRIES = [
  { href: "/user/articles", label: "我的文章", icon: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" },
  { href: "/user/posts", label: "我的帖子", icon: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" },
  { href: "/user/drafts", label: "草稿箱", icon: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" },
  { href: "/user/comments", label: "我的评论", icon: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" },
  { href: "/user/favorites", label: "收藏夹", icon: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" },
  { href: "/user/notifications", label: "通知中心", icon: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" },
]

export default function UserDashboardPage() {
  const [userInfo, setUserInfo] = useState({
    id: 0,
    username: "",
    email: "",
    role: "user",
  })

  useEffect(() => {
    const token = getToken()
    if (token) {
      const payload = parseJwtPayload(token)
      if (payload) {
        setUserInfo({
          id: payload.user_id || 0,
          username: payload.username || "",
          email: "",
          role: payload.role || "user",
        })
      }
    }
  }, [])

  const isAdmin = userInfo.role === "admin" || userInfo.role === "super_admin"

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 欢迎横幅 + 统计卡片 — 双栏布局 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* 欢迎横幅 — 占据 2/3 宽度 */}
        <div className="lg:col-span-2 rounded-xl sm:rounded-2xl border border-zinc-200/80 bg-gradient-to-r from-blue-50 via-white to-indigo-50 p-4 sm:p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex items-center justify-center size-10 sm:size-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-base sm:text-lg font-bold shadow-sm shrink-0">
                {userInfo.username.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base sm:text-lg font-bold text-zinc-900 truncate">你好，{userInfo.username}</h2>
                  <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 whitespace-nowrap">
                    <span className="size-1.5 rounded-full bg-emerald-500 shrink-0" />
                    正常
                  </span>
                </div>
                <p className="mt-0.5 text-xs sm:text-sm text-zinc-500 truncate">{userInfo.email}</p>
              </div>
            </div>
            {/* UID + 角色 */}
            <div className="flex items-center justify-end gap-4 sm:gap-6 text-center shrink-0">
              <div className="flex flex-col items-center">
                <p className="text-[10px] sm:text-xs text-zinc-400">UID</p>
                <p className="text-xs sm:text-sm font-medium text-zinc-700">{userInfo.id}</p>
              </div>
              <div className="flex flex-col items-center">
                <p className="text-[10px] sm:text-xs text-zinc-400">角色</p>
                <p className="text-xs sm:text-sm font-medium text-zinc-700">
                  {ROLE_LABELS[userInfo.role] || "用户"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 统计卡片 — 占据 1/3 宽度 */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <StatCard icon="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" label="文章" value={0} color="blue" />
          <StatCard icon="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" label="帖子" value={0} color="emerald" />
          <StatCard icon="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" label="评论" value={0} color="orange" />
        </div>
      </div>

      {/* 快捷入口 — 2/3/6 列自适应 */}
      <div>
        <h3 className="text-xs sm:text-sm font-semibold text-zinc-500 mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2">
          <svg className="size-3.5 sm:size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
          快捷入口
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
          {QUICK_ENTRIES.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex flex-col items-center justify-center gap-1.5 sm:gap-2.5 p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-zinc-200/80 bg-white hover:border-blue-300 hover:bg-blue-50/30 hover:shadow-md transition-all duration-200 no-underline"
            >
              <div className="flex items-center justify-center size-9 sm:size-11 rounded-lg sm:rounded-xl bg-zinc-50 group-hover:bg-blue-50 transition-colors">
                <svg className="size-4 sm:size-5 text-zinc-500 group-hover:text-blue-500 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d={item.icon} />
                </svg>
              </div>
              <span className="text-[10px] sm:text-xs font-medium text-zinc-600 group-hover:text-blue-600 transition-colors">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* 双栏：账号信息 + 权限概览 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        {/* 账号信息 */}
        <div className="rounded-xl sm:rounded-2xl border border-zinc-200/80 bg-white p-4 sm:p-5 shadow-sm">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4">
            <svg className="size-3.5 sm:size-4 text-zinc-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            <h3 className="text-xs sm:text-sm font-semibold text-zinc-800">账号信息</h3>
          </div>
          <div className="space-y-2 sm:space-y-3">
            <InfoRow label="主角色" value={ROLE_LABELS[userInfo.role] || "用户"} />
            <InfoRow label="UID" value={String(userInfo.id)} />
            <InfoRow label="邮箱" value={userInfo.email} />
            <InfoRow label="用户名" value={userInfo.username} />
          </div>
        </div>

        {/* 权限概览 */}
        <div className="rounded-xl sm:rounded-2xl border border-zinc-200/80 bg-white p-4 sm:p-5 shadow-sm">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4">
            <svg className="size-3.5 sm:size-4 text-zinc-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <h3 className="text-xs sm:text-sm font-semibold text-zinc-800">权限概览</h3>
          </div>
          <div className="space-y-2 sm:space-y-3">
            <p className="text-[10px] sm:text-xs text-zinc-400">
              {isAdmin ? "拥有全部管理权限" : "基础用户权限"}
            </p>
            <div className="flex flex-wrap gap-1 sm:gap-1.5">
              {isAdmin ? (
                <>
                  <code className="text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 sm:py-1 rounded bg-zinc-100 text-zinc-600 font-mono inline-flex items-center gap-1">管理用户</code>
                  <code className="text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 sm:py-1 rounded bg-zinc-100 text-zinc-600 font-mono inline-flex items-center gap-1">管理版块</code>
                  <code className="text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 sm:py-1 rounded bg-zinc-100 text-zinc-600 font-mono inline-flex items-center gap-1">站点设置</code>
                  <code className="text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 sm:py-1 rounded bg-zinc-100 text-zinc-600 font-mono inline-flex items-center gap-1">主题管理</code>
                </>
              ) : (
                <>
                  <code className="text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 sm:py-1 rounded bg-zinc-100 text-zinc-600 font-mono inline-flex items-center gap-1">发帖</code>
                  <code className="text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 sm:py-1 rounded bg-zinc-100 text-zinc-600 font-mono inline-flex items-center gap-1">评论</code>
                  <code className="text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 sm:py-1 rounded bg-zinc-100 text-zinc-600 font-mono inline-flex items-center gap-1">收藏</code>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
