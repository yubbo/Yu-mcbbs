// app/(auth)/register/page.tsx — 注册页
// 已登录用户自动跳转到首页

import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { RegisterForm } from "@/modules/auth/RegisterForm"
import Link from "next/link"

export default async function RegisterPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value
  if (token) {
    redirect("/")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-center text-2xl">注册</CardTitle>
        </CardHeader>
        <CardContent>
          <RegisterForm />
          <p className="text-center text-sm text-muted-foreground mt-4">
            已有账号？
            <Link href="/login" className="text-primary hover:underline ml-1">
              去登录
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
