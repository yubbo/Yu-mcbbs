"use client"

// modules/userpanel/shared/StatCard.tsx
// 统计卡片组件 — 控制台仪表盘中文章/帖子/评论统计小卡片

interface Props {
  icon: string
  label: string
  value: number
  color: "blue" | "emerald" | "orange"
}

const COLORS = {
  blue: { bg: "bg-blue-50", text: "text-blue-600", icon: "text-blue-500" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-600", icon: "text-emerald-500" },
  orange: { bg: "bg-orange-50", text: "text-orange-600", icon: "text-orange-500" },
}

export function StatCard({ icon, label, value, color }: Props) {
  const c = COLORS[color]
  return (
    <div className={`${c.bg} rounded-xl p-3 sm:p-4 flex flex-col items-center justify-center`}>
      <svg className={`size-5 sm:size-6 ${c.icon} mb-1.5 sm:mb-2`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d={icon} />
      </svg>
      <span className={`text-xl sm:text-2xl font-bold ${c.text}`}>{value}</span>
      <span className="text-[10px] sm:text-xs text-zinc-500 mt-0.5">{label}</span>
    </div>
  )
}
