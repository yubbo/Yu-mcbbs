"use client"

// components/PublicFooter.tsx — 公共底部
// 由 LayoutShell 条件渲染，客户端组件避免 Date 水合不一致

import { useState, useEffect } from "react"

export function PublicFooter() {
  const [year, setYear] = useState<number | null>(null)

  useEffect(() => {
    setYear(new Date().getFullYear())
  }, [])

  return (
    <footer className="border-t bg-white py-8 px-6">
      <div className="max-w-6xl mx-auto text-center">
        <p className="text-xs text-zinc-400" suppressHydrationWarning>
          &copy; {year ?? ""} BBS CMS. Built with Next.js &amp; Go.
        </p>
      </div>
    </footer>
  )
}
