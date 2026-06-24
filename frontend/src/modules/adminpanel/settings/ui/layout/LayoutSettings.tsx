"use client"

// modules/adminpanel/settings/ui/layout/LayoutSettings.tsx — 界面布局
// 宽屏/窄屏切换、页面宽度设置

import { useEffect, useState } from "react"
import { apiGet, apiPut } from "@/lib/api"
import { toast } from "sonner"

interface SettingItem {
  id: number
  key: string
  value: string
  label: string
  group: string
  editable: boolean
}

export function LayoutSettings() {
  const [layoutMode, setLayoutMode] = useState<string>("narrow")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const isWide = layoutMode === "wide"

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await apiGet<Record<string, SettingItem[]>>("/api/v1/adminpanel/settings")
        const layoutItems = settings.layout || []
        const mode = layoutItems.find((s) => s.key === "layout_mode")?.value || "narrow"
        setLayoutMode(mode)
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "未知错误"
        toast.error("加载设置失败", { description: msg })
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [])

  const toggleLayoutMode = async () => {
    const newMode = isWide ? "narrow" : "wide"
    setSaving(true)
    try {
      await apiPut("/api/v1/adminpanel/settings/layout_mode", { value: newMode })
      setLayoutMode(newMode)
      // 同步更新 html 属性，即时生效
      document.documentElement.setAttribute("data-layout-mode", newMode)
      toast.success(newMode === "wide" ? "已切换为宽屏模式" : "已切换为窄屏模式")
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "未知错误"
      toast.error("切换失败", { description: msg })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">界面布局</h1>
          <p className="text-sm text-zinc-500 mt-1">全宽/窄宽、侧边栏位置、页宽</p>
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 p-6">
          <p className="text-sm text-zinc-400">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">界面布局</h1>
        <p className="text-sm text-zinc-500 mt-1">全宽/窄宽、侧边栏位置、页宽</p>
      </div>

      {/* 页面宽度 */}
      <div className="bg-white rounded-xl border border-zinc-200 p-6">
        <h2 className="text-sm font-semibold text-zinc-900 mb-4">页面宽度</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-700">
              {isWide ? "宽屏模式" : "窄屏模式"}
            </p>
            <p className="text-xs text-zinc-400 mt-0.5">
              {isWide
                ? "内容将撑满整个屏幕宽度，适合大屏展示"
                : "内容限制在安全阅读宽度内，适合常规浏览"}
            </p>
          </div>
          <button
            onClick={toggleLayoutMode}
            disabled={saving}
            className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer border-none ${
              isWide ? "bg-zinc-900" : "bg-zinc-300"
            }`}
            aria-label={isWide ? "切换为窄屏" : "切换为宽屏"}
          >
            <span
              className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-transform ${
                isWide ? "left-[22px]" : "left-0.5"
              }`}
            />
          </button>
        </div>
      </div>

      {/* 预览提示 */}
      <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50 p-6">
        <p className="text-xs text-zinc-400 text-center">
          切换后全站前台页面即时生效，管理端不受影响。
        </p>
      </div>
    </div>
  )
}
