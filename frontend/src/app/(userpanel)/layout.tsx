"use client"

// app/(userpanel)/layout.tsx — 用户个人中心布局
// 左侧侧边栏 + 右侧内容区，所有 /user/* 页面共享
// 未登录重定向到登录页

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getToken, removeToken } from "@/lib/auth"
import { parseJwtPayload } from "@/lib/hooks/useJwtPayload"
import { UserSidebar } from "./_components/UserSidebar"

export default function UserPanelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [role, setRole] = useState("")

  useEffect(() => {
    const token = getToken()
    if (!token) {
      router.replace("/login?redirect=/user")
      return
    }
    const payload = parseJwtPayload(token)
    if (!payload) {
      removeToken()
      router.replace("/login")
      return
    }
    setUsername(payload.username || "")
    setEmail("")
    setRole(payload.role || "user")
    setReady(true)
  }, [router])

  const handleLogout = () => {
    removeToken()
    router.replace("/login")
  }

  if (!ready) return null

  return (
    <div className="max-w-[1400px] mx-auto w-full px-3 sm:px-5 py-4 sm:py-5">
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
        {/* 左侧侧边栏 */}
        <UserSidebar
          username={username}
          email={email}
          avatar=""
          role={role}
          onLogout={handleLogout}
        />
        {/* 右侧内容区 */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  )
}
