"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[App Error]", error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-zinc-300 mb-4">500</h1>
        <h2 className="text-xl font-semibold text-zinc-800 mb-2">出错了</h2>
        <p className="text-sm text-zinc-500 mb-6 leading-relaxed">
          {error.message || "页面加载过程中发生了未知错误，请稍后重试。"}
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button onClick={reset}>重试</Button>
          <Button variant="outline" onClick={() => window.location.href = "/"}>
            返回首页
          </Button>
        </div>
      </div>
    </div>
  )
}
