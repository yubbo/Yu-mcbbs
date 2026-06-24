"use client"

// components/UserAvatarMenu.tsx — 登录后的头像下拉菜单
// 鼠标移入显示动画 + 下拉菜单（UID/在线状态/个人中心/管理后台/退出），移出隐藏
// 点击头像直接跳转 /user

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { getToken, removeToken } from "@/lib/auth"
import { useJwtPayload, parseJwtPayload } from "@/lib/hooks/useJwtPayload"
import { ROLE_LABELS } from "@/lib/constants"
import { apiGet } from "@/lib/api"

interface UserInfo {
  id: number
  username: string
  avatar: string
  role: string
}

export function UserAvatarMenu() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [online, setOnline] = useState(true)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const token = getToken()
    if (!token) { setLoading(false); return }

    // 先从 JWT 快速读取（已登录用户必然有 token）
    const payload = parseJwtPayload(token)
    if (payload) {
      setUser({
        id: payload.user_id || 0,
        username: payload.username || "",
        avatar: "",
        role: payload.role || "user",
      })
    }

    // 从后端获取完整资料（含头像 + UID）
    const abort = new AbortController()
    apiGet<{ id: number; username: string; avatar: string; role: string }>("/api/v1/userpanel/profile")
      .then((data) => {
        setUser({
          id: data.id,
          username: data.username,
          avatar: data.avatar || "",
          role: data.role || "user",
        })
      })
      .catch((err) => {
        if (err instanceof Error) {
          const msg = err.message
          // 用户已被删除或不存在 → 清除过期 token
          if (msg.includes("不存在") || msg.includes("删除") || msg.includes("失效")) {
            removeToken()
            setUser(null)
            return
          }
          if (err.name !== "AbortError") {
            console.error("[UserAvatarMenu] 获取用户资料失败:", msg)
          }
        }
      })
      .finally(() => setLoading(false))

    return () => { abort.abort() }
  }, [])

  const handleMouseEnter = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setOpen(true)
  }

  const handleMouseLeave = () => {
    timerRef.current = setTimeout(() => setOpen(false), 200)
  }

  const handleLogout = () => {
    removeToken()
    router.replace("/login")
  }

  const handleToggleOnline = () => {
    setOnline(!online)
    if (online) {
      toast("已切换为隐身状态", {
        description: "其他用户将看到你不在线",
        icon: (
          <svg className="size-4 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a19.07 19.07 0 015.07-5.62M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
            <line x1="1" y1="1" x2="23" y2="23" />
          </svg>
        ),
      })
    } else {
      toast.success("已切换为在线状态", {
        description: "其他用户可以看到你在线",
      })
    }
  }

  if (!user || loading) return null

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* 头像按钮 */}
      <button
        onClick={() => router.push("/user")}
        className="relative flex items-center justify-center size-9 rounded-full transition-all duration-500 ease-out cursor-pointer border-0 bg-transparent p-0 group"
        aria-label="个人中心"
      >
        {/* 在线状态指示点 */}
        <span className={`absolute -top-0.5 -right-0.5 size-2.5 rounded-full border-2 border-white z-10 transition-colors duration-300 ${
          online ? "bg-emerald-400" : "bg-zinc-300"
        }`} />

        {/* 发光环 */}
        <div className={`absolute inset-0 rounded-full transition-all duration-500 ease-out ${
          open
            ? "ring-2 ring-blue-400/50 shadow-[0_0_12px_rgba(96,165,250,0.4)]"
            : "ring-1 ring-zinc-200 shadow-none"
        }`} />

        {/* 头像内容 */}
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.username}
            className={`size-full rounded-full object-cover transition-transform duration-500 ease-out ${
              open ? "rotate-180 scale-105" : "rotate-0 scale-100"
            }`}
          />
        ) : (
          <div
            className={`size-full rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold transition-all duration-500 ease-out ${
              open ? "rotate-180 scale-105 shadow-[0_0_16px_rgba(99,102,241,0.5)]" : "rotate-0 scale-100"
            }`}
          >
            <span className={open ? "-rotate-180" : ""}>
              {user.username.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </button>

      {/* 下拉菜单 */}
      <div
        className={`absolute right-0 top-full mt-2 w-44 bg-white rounded-xl border border-zinc-200/80 shadow-lg overflow-hidden transition-all duration-200 origin-top-right ${
          open
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 -translate-y-1 pointer-events-none"
        }`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* 用户信息行 */}
        <div className="px-4 py-2.5 border-b border-zinc-100">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-zinc-900 truncate">{user.username}</p>
            <span className={`size-1.5 rounded-full shrink-0 ${online ? "bg-emerald-400" : "bg-zinc-300"}`} />
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-[10px] text-zinc-400">
              UID: {user.id}
            </p>
            <span className="text-[10px] text-zinc-300">·</span>
            <p className="text-[10px] text-zinc-400">
              {ROLE_LABELS[user.role] || user.role}
            </p>
          </div>
        </div>

        {/* 菜单项 */}
        <div className="py-1">
          <Link
            href="/user"
            className="flex items-center gap-2.5 px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors no-underline"
          >
            <svg className="size-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
              <circle cx="9" cy="7" r="4" />
            </svg>
            <span>个人中心</span>
          </Link>
          {user.role === "super_admin" || user.role === "admin" ? (
            <Link
              href="/admin"
              className="flex items-center gap-2.5 px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors no-underline"
            >
              <svg className="size-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
              </svg>
              <span>管理后台</span>
            </Link>
          ) : null}
        </div>

        {/* 在线状态切换 */}
        <div className="border-t border-zinc-100 py-1">
          <button
            onClick={handleToggleOnline}
            className={`flex items-center gap-2.5 w-full px-4 py-2 text-sm transition-colors cursor-pointer bg-transparent border-none text-left ${
              online
                ? "text-emerald-600 hover:bg-emerald-50"
                : "text-zinc-400 hover:bg-zinc-50 hover:text-zinc-600"
            }`}
          >
            <svg className="size-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {online ? (
                <>
                  <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </>
              ) : (
                <>
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </>
              )}
            </svg>
            <span>{online ? "切换隐身" : "切换在线"}</span>
          </button>
        </div>

        {/* 退出 */}
        <div className="border-t border-zinc-100 py-1">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer bg-transparent border-none text-left"
          >
            <svg className="size-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
            <span>退出登录</span>
          </button>
        </div>
      </div>
    </div>
  )
}
