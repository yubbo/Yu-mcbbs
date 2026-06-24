"use client"

// modules/adminpanel/settings/ui/theme/ThemeSettings.tsx — 主题模块
// 双标签：已安装（本地管理）+ 应用中心（在线市场）

import { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { PopupModal } from "@/components/overlay/PopupModal"
import { ThemeMarket } from "./ThemeMarket"

interface ThemeInfo {
  name: string
  valid: boolean
  reason?: string
  config: {
    name: string
    version: string
    description?: string
    author?: string
    modules?: string[]
  }
  active: boolean
}

export function ThemeSettings() {
  const [themes, setThemes] = useState<ThemeInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [dragover, setDragover] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [tab, setTab] = useState<"installed" | "market">("installed")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchThemes = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiGet<ThemeInfo[]>("/api/v1/adminpanel/themes")
      setThemes(data || [])
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      toast.error("获取主题列表失败", { description: msg })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchThemes() }, [fetchThemes])

  // ── 上传 ──
  const handleUpload = async (file: File) => {
    if (!file.name.endsWith(".zip")) {
      toast.error("仅支持 .zip 格式")
      return
    }
    if (file.size > 50 * 1024 * 1024) {
      toast.error("文件大小不能超过 50MB")
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      // 直接用 fetch 因为 apiPost 不支持 FormData
      const token = localStorage.getItem("token")
      const res = await fetch("/api/v1/adminpanel/themes/upload", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      })
      const body = await res.json()
      if (body.code !== 0) throw new Error(body.message || "上传失败")

      toast.success("主题安装成功", {
        description: `"${body.data?.config?.name || body.data?.name}" 已安装`,
      })
      fetchThemes()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      toast.error("安装失败", { description: msg })
    } finally {
      setUploading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleUpload(file)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragover(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleUpload(file)
  }

  // ── 操作 ──
  const handleActivate = async (name: string) => {
    try {
      await apiPut(`/api/v1/adminpanel/themes/${name}/activate`)
      toast.success(`已启用主题 "${name}"`)
      fetchThemes()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      toast.error("启用失败", { description: msg })
    }
  }

  const handleDeactivate = async (name: string) => {
    try {
      await apiPut(`/api/v1/adminpanel/themes/${name}/deactivate`)
      toast.success(`已停用主题 "${name}"，已回退到默认主题`)
      fetchThemes()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      toast.error("停用失败", { description: msg })
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await apiDelete(`/api/v1/adminpanel/themes/${deleteTarget}`)
      toast.success(`主题 "${deleteTarget}" 已删除`)
      setDeleteTarget(null)
      fetchThemes()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      toast.error("删除失败", { description: msg })
    } finally {
      setDeleting(false)
    }
  }

  const handleDelete = async (name: string) => {
    setDeleteTarget(name)
  }

  const validThemes = themes.filter((t) => t.valid)
  const invalidThemes = themes.filter((t) => !t.valid)
  const hasActiveTheme = themes.some((t) => t.active)

  return (
    <div className="space-y-6">
      {/* 标题 */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">主题模块</h1>
        <p className="text-sm text-zinc-500 mt-1">上传、管理和发现站点主题</p>
      </div>

      {/* 标签切换：已安装 | 应用中心 */}
      <div className="flex border-b border-zinc-200">
        <button
          onClick={() => setTab("installed")}
          className={`px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer bg-transparent border-none border-b-2 ${
            tab === "installed"
              ? "border-zinc-900 text-zinc-900"
              : "border-transparent text-zinc-400 hover:text-zinc-600"
          }`}
        >
          已安装
        </button>
        <button
          onClick={() => setTab("market")}
          className={`px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer bg-transparent border-none border-b-2 ${
            tab === "market"
              ? "border-zinc-900 text-zinc-900"
              : "border-transparent text-zinc-400 hover:text-zinc-600"
          }`}
        >
          应用中心
        </button>
      </div>

      {tab === "market" ? (
        <ThemeMarket onInstalled={fetchThemes} />
      ) : (
        <>{/* 已安装标签内容 */}

      {/* 兜底状态提示 */}
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 border border-blue-100 text-xs text-blue-700">
        <svg className="size-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
        <span>
          当前{hasActiveTheme ? `启用: ${themes.find((t) => t.active)?.name}` : "使用默认主题"}。
          三层兜底：用户选择 &gt; 默认主题 &gt; 内核兜底。
        </span>
      </div>

      {/* 上传区域 */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          dragover
            ? "border-blue-400 bg-blue-50"
            : "border-zinc-200 hover:border-zinc-400 bg-zinc-50/50"
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragover(true) }}
        onDragLeave={() => setDragover(false)}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".zip"
          onChange={handleFileSelect}
          className="absolute inset-0 opacity-0 cursor-pointer"
          disabled={uploading}
        />
        <div className="flex flex-col items-center gap-2 pointer-events-none">
          {uploading ? (
            <>
              <svg className="size-8 text-blue-400 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
              <p className="text-sm font-medium text-zinc-600">正在安装主题...</p>
            </>
          ) : (
            <>
              <svg className="size-8 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
              <p className="text-sm font-medium text-zinc-600">拖拽主题压缩包到此处，或点击选择</p>
              <p className="text-xs text-zinc-400">仅支持 .zip 格式，需包含 default_*_theme.json 和 style.css</p>
            </>
          )}
        </div>
      </div>

      {/* 主题列表 */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <svg className="size-6 text-zinc-400 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
          <span className="ml-2 text-sm text-zinc-400">加载中...</span>
        </div>
      ) : validThemes.length === 0 ? (
        <div className="text-center py-12">
          <div className="size-16 rounded-2xl bg-zinc-100 flex items-center justify-center mx-auto mb-3">
            <svg className="size-8 text-zinc-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
          </div>
          <p className="text-sm text-zinc-500">暂无已安装的主题</p>
          <p className="text-xs text-zinc-400 mt-1">上传一个主题压缩包开始使用</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {validThemes.map((theme) => (
            <ThemeCard
              key={theme.name}
              theme={theme}
              onActivate={() => handleActivate(theme.name)}
              onDeactivate={() => handleDeactivate(theme.name)}
              onDelete={() => handleDelete(theme.name)}
            />
          ))}
        </div>
      )}

      {/* 无效主题列表 */}
      {invalidThemes.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-zinc-900 mb-3">无效主题</h3>
          <div className="space-y-2">
            {invalidThemes.map((theme) => (
              <div
                key={theme.name}
                className="flex items-center justify-between p-3 rounded-lg border border-red-100 bg-red-50"
              >
                <div>
                  <p className="text-sm font-medium text-zinc-700">{theme.name}</p>
                  <p className="text-xs text-red-500 mt-0.5">{theme.reason}</p>
                </div>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(theme.name)}>
                  删除
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 删除确认弹窗 — 使用 popup_effect 弹簧弹跳动画 */}
      <PopupModal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        effect={3}
        title="确认删除主题"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setDeleteTarget(null)}>
              取消
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDeleteConfirm} disabled={deleting}>
              {deleting ? "删除中..." : "确认删除"}
            </Button>
          </>
        }
      >
        <div className="space-y-2">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50 border border-red-100">
            <svg className="size-5 text-red-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>
            <p className="text-sm text-red-700">
              确定要永久删除主题 <span className="font-semibold">"{deleteTarget}"</span> 吗？
            </p>
          </div>
          <p className="text-xs text-zinc-400">此操作不可撤销，主题的所有文件将被永久删除。</p>
        </div>
      </PopupModal>
      </>
      )}
    </div>
  )
}

// ── 主题卡片 ──
function ThemeCard({
  theme,
  onActivate,
  onDeactivate,
  onDelete,
}: {
  theme: ThemeInfo
  onActivate: () => void
  onDeactivate: () => void
  onDelete: () => void
}) {
  const { config, active } = theme

  return (
    <div
      className={`rounded-xl border overflow-hidden transition-all ${
        active
          ? "border-blue-300 bg-blue-50/40 ring-1 ring-blue-200 shadow-sm"
          : "border-zinc-200 bg-white hover:shadow-sm"
      }`}
    >
      {/* 卡片头部 */}
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-zinc-900 truncate">{config.name}</h3>
              {active && (
                <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium shrink-0">
                  <span className="size-1.5 rounded-full bg-blue-500" />
                  已启用
                </span>
              )}
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">v{config.version}</p>
          </div>
        </div>

        {config.description && (
          <p className="text-xs text-zinc-500 mt-2 line-clamp-2">{config.description}</p>
        )}

        <div className="flex items-center gap-3 mt-3 text-[10px] text-zinc-400">
          {config.author && <span>作者: {config.author}</span>}
          {config.modules && config.modules.length > 0 && (
            <span>模块: {config.modules.join(", ")}</span>
          )}
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex border-t border-zinc-100">
        {active ? (
          <>
            <button
              onClick={onDeactivate}
              className="flex-1 py-2.5 text-xs font-medium text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700 transition-colors cursor-pointer bg-transparent border-none"
            >
              卸载（停用）
            </button>
          </>
        ) : (
          <>
            <button
              onClick={onActivate}
              className="flex-1 py-2.5 text-xs font-medium text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer bg-transparent border-none"
            >
              启动
            </button>
            <button
              onClick={onDelete}
              className="flex-1 py-2.5 text-xs font-medium text-zinc-400 hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer bg-transparent border-none border-l border-zinc-100"
            >
              删除
            </button>
          </>
        )}
      </div>
    </div>
  )
}
