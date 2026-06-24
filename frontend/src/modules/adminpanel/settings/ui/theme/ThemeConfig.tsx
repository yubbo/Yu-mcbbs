"use client"

// modules/adminpanel/settings/ui/theme/ThemeConfig.tsx — 主题设置
// 根据激活主题的 setting_schema 动态渲染配置表单

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { apiGet, apiPut } from "@/lib/api"

interface SchemaItem {
  key: string
  type: string // color | text | toggle | select | number
  label: string
  default?: string
  options?: { label: string; value: string }[]
  min?: number
  max?: number
}

interface ThemeSettingsData {
  schema: SchemaItem[]
  values: Record<string, string>
}

export function ThemeConfig() {
  const [schema, setSchema] = useState<SchemaItem[]>([])
  const [values, setValues] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<Record<string, boolean>>({})

  useEffect(() => {
    apiGet<ThemeSettingsData>("/api/v1/adminpanel/themes/settings")
      .then((data) => {
        setSchema(data.schema || [])
        setValues(data.values || {})
      })
      .catch(() => toast.error("获取主题设置失败"))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async (key: string, value: string) => {
    setSaving((prev) => ({ ...prev, [key]: true }))
    try {
      await apiPut(`/api/v1/adminpanel/themes/settings/${key}`, { value })
      setValues((prev) => ({ ...prev, [key]: value }))
      toast.success("已保存")
    } catch {
      toast.error("保存失败")
    } finally {
      setSaving((prev) => ({ ...prev, [key]: false }))
    }
  }

  const handleChange = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <svg className="size-6 text-zinc-400 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
        <span className="ml-2 text-sm text-zinc-400">加载中...</span>
      </div>
    )
  }

  if (schema.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-zinc-500">当前主题未提供设置项</p>
        <p className="text-xs text-zinc-400 mt-1">主题开发者可通过 theme.json 的 setting_schema 字段声明可配置项</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {schema.map((item) => {
        const value = values[item.key] ?? item.default ?? ""

        return (
          <div key={item.key} className="p-4 rounded-xl border border-zinc-200 bg-white space-y-2">
            <label className="text-sm font-medium text-zinc-800">{item.label}</label>

            {item.type === "color" && (
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={value}
                  onChange={(e) => handleChange(item.key, e.target.value)}
                  className="size-8 rounded border border-zinc-200 cursor-pointer p-0.5"
                />
                <input
                  type="text"
                  value={value}
                  onChange={(e) => handleChange(item.key, e.target.value)}
                  className="w-24 h-8 px-2 rounded border border-zinc-200 text-xs font-mono text-zinc-600 outline-none focus:border-blue-400"
                />
                <button
                  onClick={() => handleSave(item.key, value)}
                  disabled={saving[item.key]}
                  className="ml-auto px-3 py-1.5 bg-zinc-900 text-white rounded-md text-xs font-medium hover:bg-zinc-800 transition-colors cursor-pointer border-none disabled:opacity-50"
                >
                  {saving[item.key] ? "保存中" : "保存"}
                </button>
              </div>
            )}

            {item.type === "text" && (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={value}
                  onChange={(e) => handleChange(item.key, e.target.value)}
                  className="flex-1 h-9 px-3 rounded-lg border border-zinc-200 text-sm outline-none focus:border-blue-400"
                />
                <button
                  onClick={() => handleSave(item.key, value)}
                  disabled={saving[item.key]}
                  className="px-3 py-1.5 bg-zinc-900 text-white rounded-md text-xs font-medium hover:bg-zinc-800 transition-colors cursor-pointer border-none disabled:opacity-50"
                >
                  {saving[item.key] ? "保存中" : "保存"}
                </button>
              </div>
            )}

            {item.type === "number" && (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={value}
                  min={item.min}
                  max={item.max}
                  onChange={(e) => handleChange(item.key, e.target.value)}
                  className="flex-1 h-9 px-3 rounded-lg border border-zinc-200 text-sm outline-none focus:border-blue-400"
                />
                <button
                  onClick={() => handleSave(item.key, value)}
                  disabled={saving[item.key]}
                  className="px-3 py-1.5 bg-zinc-900 text-white rounded-md text-xs font-medium hover:bg-zinc-800 transition-colors cursor-pointer border-none disabled:opacity-50"
                >
                  {saving[item.key] ? "保存中" : "保存"}
                </button>
              </div>
            )}

            {item.type === "select" && item.options && (
              <div className="flex items-center gap-2">
                <select
                  value={value}
                  onChange={(e) => handleChange(item.key, e.target.value)}
                  className="flex-1 h-9 px-3 rounded-lg border border-zinc-200 text-sm bg-white cursor-pointer outline-none focus:border-blue-400"
                >
                  {item.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <button
                  onClick={() => handleSave(item.key, value)}
                  disabled={saving[item.key]}
                  className="px-3 py-1.5 bg-zinc-900 text-white rounded-md text-xs font-medium hover:bg-zinc-800 transition-colors cursor-pointer border-none disabled:opacity-50"
                >
                  {saving[item.key] ? "保存中" : "保存"}
                </button>
              </div>
            )}

            {item.type === "toggle" && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSave(item.key, value === "true" ? "false" : "true")}
                  className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer border-none ${
                    value === "true" ? "bg-zinc-900" : "bg-zinc-200"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 size-4 rounded-full bg-white shadow transition-transform ${
                      value === "true" ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
                <span className="text-xs text-zinc-500">{value === "true" ? "已开启" : "已关闭"}</span>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
