"use client"

// components/PublicHeader.tsx — 公共顶部导航
// 所有非管理端页面共享，由 LayoutShell 条件渲染

import Link from "next/link"
import { useState, useEffect } from "react"
import { getToken } from "@/lib/auth"
import { UserAvatarMenu } from "@/components/user/UserAvatarMenu"

export function PublicHeader() {
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    setLoggedIn(!!getToken())
  }, [])

  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg text-zinc-900 no-underline">
          BBS CMS
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/" className="text-zinc-600 hover:text-zinc-900 no-underline transition-colors">
            首页
          </Link>
          <Link href="/forum" className="text-zinc-600 hover:text-zinc-900 no-underline transition-colors">
            论坛
          </Link>
          {loggedIn ? (
            <UserAvatarMenu />
          ) : (
            <>
              <Link
                href="/login"
                className="text-zinc-600 hover:text-zinc-900 no-underline transition-colors"
              >
                登录
              </Link>
              <Link
                href="/register"
                className="px-3 py-1.5 bg-zinc-900 text-white rounded-md text-xs no-underline hover:bg-zinc-800 transition-colors"
              >
                注册
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
