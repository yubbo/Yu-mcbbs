"use client"

// components/Drawer.tsx — 右侧滑入抽屉
// 用于管理后台"主题"等侧边栏点击弹出场景

import { useEffect, useState } from "react"

interface DrawerProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  tabs?: { key: string; label: string }[]
  activeTab?: string
  onTabChange?: (key: string) => void
}

export function Drawer({ open, onClose, title, children, tabs, activeTab, onTabChange }: DrawerProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (open) {
      // 延迟一帧触发动画
      requestAnimationFrame(() => setVisible(true))
      document.body.style.overflow = "hidden"
    } else {
      setVisible(false)
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      {/* 遮罩层 */}
      <div
        className={`absolute inset-0 bg-black/20 transition-opacity duration-300 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* 抽屉面板 */}
      <div
        className={`absolute top-0 right-0 h-full w-[480px] max-w-[90vw] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          visible ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* 标题栏 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 shrink-0">
          <h2 className="text-lg font-bold text-zinc-900">{title}</h2>
          <button
            onClick={onClose}
            className="size-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors cursor-pointer bg-transparent border-none"
          >
            <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* 标签栏 */}
        {tabs && tabs.length > 0 && (
          <div className="flex border-b border-zinc-200 shrink-0">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => onTabChange?.(tab.key)}
                className={`flex-1 py-3 text-sm font-medium transition-colors cursor-pointer bg-transparent border-none border-b-2 ${
                  activeTab === tab.key
                    ? "border-zinc-900 text-zinc-900"
                    : "border-transparent text-zinc-400 hover:text-zinc-600"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* 内容区 */}
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  )
}
