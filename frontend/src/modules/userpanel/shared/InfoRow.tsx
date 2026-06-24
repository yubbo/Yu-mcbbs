"use client"

// modules/userpanel/shared/InfoRow.tsx
// 信息行组件 — 账号信息等卡片中的键值对行

interface Props {
  label: string
  value: string
}

export function InfoRow({ label, value }: Props) {
  return (
    <div className="flex items-center justify-between py-1.5 sm:py-2 border-b border-zinc-50 last:border-0">
      <span className="text-[10px] sm:text-xs text-zinc-500 flex items-center gap-1.5 sm:gap-2">
        <svg className="size-3 sm:size-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/></svg>
        {label}
      </span>
      <span className="text-xs sm:text-sm text-zinc-800 font-medium truncate max-w-[50%]">{value}</span>
    </div>
  )
}
