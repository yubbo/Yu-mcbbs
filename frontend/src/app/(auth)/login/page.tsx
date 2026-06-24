"use client"

// app/(auth)/login/page.tsx — 登录页（全客户端组件，避免 hydration 问题）

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { LoginForm } from "@/modules/auth/LoginForm"
import Link from "next/link"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-center text-2xl">登录</CardTitle>
        </CardHeader>
        <CardContent>
          <LoginForm />
          <p className="text-center text-sm text-muted-foreground mt-4">
            还没有账号？
            <Link href="/register" className="text-primary hover:underline ml-1">
              立即注册
            </Link>
          </p>
          <p className="text-center mt-3">
            <Link href="/" className="text-xs text-zinc-400 hover:text-zinc-600 no-underline transition-colors">
              ← 返回首页
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
