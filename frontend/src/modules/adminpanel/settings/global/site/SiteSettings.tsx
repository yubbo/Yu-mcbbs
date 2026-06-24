"use client"

// modules/adminpanel/settings/global/site/SiteSettings.tsx — 站点信息
// 对应 Go 后端: GET/PUT /api/v1/adminpanel/settings

import { useEffect, useState, useRef } from "react"
import { apiGet, apiPut } from "@/lib/api"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface SettingItem {
  id: number
  key: string
  value: string
  label: string
  group: string
  editable: boolean
}

export function SiteSettings() {
  const [settings, setSettings] = useState<Record<string, SettingItem[]>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<Record<string, boolean>>({})
  const [editing, setEditing] = useState<Record<string, string>>({})
  const bgInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    apiGet<Record<string, SettingItem[]>>("/api/v1/adminpanel/settings")
      .then((data) => {
        setSettings(data)
        const init: Record<string, string> = {}
        Object.values(data).forEach((items) => {
          items.forEach((s) => {
            if (s.editable) init[s.key] = s.value
          })
        })
        setEditing(init)
      })
      .catch(() => toast.error("加载设置失败"))
      .finally(() => setLoading(false))
  }, [])

  const saveSetting = async (key: string) => {
    const value = editing[key]
    setSaving((p) => ({ ...p, [key]: true }))
    try {
      await apiPut(`/api/v1/adminpanel/settings/${key}`, { value })
      setSettings((prev) => {
        const next = { ...prev }
        for (const group of Object.keys(next)) {
          next[group] = next[group].map((s) =>
            s.key === key ? { ...s, value } : s
          )
        }
        return next
      })
      toast.success("已保存")
    } catch (e) {
      toast.error("保存失败", { description: e instanceof Error ? e.message : "" })
    } finally {
      setSaving((p) => ({ ...p, [key]: false }))
    }
  }

  const getValue = (key: string) => editing[key] ?? ""

  if (loading) {
    return <p className="text-sm text-zinc-400 py-12 text-center">加载中...</p>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">站点信息</h1>
        <p className="text-sm text-zinc-500 mt-1">站点名称、描述、Logo、背景图等基本信息</p>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-zinc-100">
          <h2 className="text-sm font-semibold text-zinc-900">基本信息</h2>
        </div>
        <div className="divide-y divide-zinc-50">
          {/* 站点名称 */}
          <FieldRow label="站点名称" htmlFor="site_name">
            <div className="flex items-center gap-2">
              <input
                id="site_name"
                type="text"
                value={getValue("site_name")}
                onChange={(e) => setEditing((p) => ({ ...p, site_name: e.target.value }))}
                className="w-full max-w-xs px-3 py-2 text-sm border border-zinc-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
              />
              <SaveBtn
                loading={saving["site_name"]}
                disabled={getValue("site_name") === (settings.site?.find((s) => s.key === "site_name")?.value ?? "")}
                onClick={() => saveSetting("site_name")}
              />
            </div>
          </FieldRow>

          {/* 站点描述 */}
          <FieldRow label="站点描述" htmlFor="site_desc">
            <div className="flex items-start gap-2">
              <textarea
                id="site_desc"
                value={getValue("site_desc")}
                onChange={(e) => setEditing((p) => ({ ...p, site_desc: e.target.value }))}
                rows={3}
                className="w-full max-w-xs px-3 py-2 text-sm border border-zinc-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-y"
              />
              <SaveBtn
                loading={saving["site_desc"]}
                disabled={getValue("site_desc") === (settings.site?.find((s) => s.key === "site_desc")?.value ?? "")}
                onClick={() => saveSetting("site_desc")}
              />
            </div>
          </FieldRow>

          {/* 全站背景图 */}
          <FieldRow label="全站背景图" htmlFor="site_bg_image">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <input
                  id="site_bg_image"
                  type="text"
                  placeholder="输入图片 URL，如 /images/bg.jpg 或 https://..."
                  value={getValue("site_bg_image")}
                  onChange={(e) => setEditing((p) => ({ ...p, site_bg_image: e.target.value }))}
                  className="w-96 px-3 py-2 text-sm border border-zinc-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                />
                <SaveBtn
                  loading={saving["site_bg_image"]}
                  disabled={getValue("site_bg_image") === (settings.site?.find((s) => s.key === "site_bg_image")?.value ?? "")}
                  onClick={() => saveSetting("site_bg_image")}
                />
              </div>
              <p className="text-xs text-zinc-400">
                留空则无背景。主题开发者可在 theme.css 中覆盖 <code className="text-xs bg-zinc-100 px-1 py-0.5 rounded">--site-bg-image</code> 变量
              </p>
              {getValue("site_bg_image") && (
                <div className="mt-1 w-48 h-24 rounded-lg border border-zinc-200 overflow-hidden bg-zinc-50">
                  <img
                    src={getValue("site_bg_image")}
                    alt="背景图预览"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none"
                    }}
                  />
                </div>
              )}
            </div>
          </FieldRow>

          {/* 当前主题（只读） */}
          <FieldRow label="当前主题" htmlFor="theme_active">
            <span className="text-sm text-zinc-600 bg-zinc-50 px-3 py-2 rounded-lg border border-zinc-200">
              {getValue("theme_active") || "default"}
            </span>
          </FieldRow>
        </div>
      </div>
    </div>
  )
}

function FieldRow({
  label,
  htmlFor,
  children,
}: {
  label: string
  htmlFor: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-6 px-5 py-4">
      <label
        htmlFor={htmlFor}
        className="w-24 shrink-0 text-sm font-medium text-zinc-700 pt-2"
      >
        {label}
      </label>
      <div className="flex-1">{children}</div>
    </div>
  )
}

function SaveBtn({
  loading,
  disabled,
  onClick,
}: {
  loading?: boolean
  disabled?: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        "shrink-0 px-3 py-2 text-sm rounded-lg transition-colors border-none cursor-pointer",
        disabled
          ? "bg-zinc-100 text-zinc-400 cursor-not-allowed"
          : "bg-blue-600 text-white hover:bg-blue-700"
      )}
    >
      {loading ? "保存中" : "保存"}
    </button>
  )
}
