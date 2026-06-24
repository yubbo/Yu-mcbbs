"use client"

// components/ComingSoon.tsx — 通用占位组件（功能开发中）

interface Props {
  title: string
  description?: string
}

export function ComingSoon({ title, description }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 sm:py-20 text-center">
      <div className="size-16 sm:size-20 rounded-2xl bg-zinc-100 flex items-center justify-center mb-4">
        <svg className="size-8 sm:size-10 text-zinc-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      </div>
      <h2 className="text-lg sm:text-xl font-bold text-zinc-800 mb-2">{title}</h2>
      <p className="text-xs sm:text-sm text-zinc-400 max-w-sm">
        {description || "功能正在开发中，敬请期待"}
      </p>
    </div>
  )
}
