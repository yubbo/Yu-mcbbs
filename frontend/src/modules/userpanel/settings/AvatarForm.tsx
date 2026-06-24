"use client"

// modules/userpanel/settings/AvatarForm.tsx — 修改头像表单

import { useState } from "react"
import { apiPut } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Props {
  user: { id: number; username: string; avatar: string }
}

export function AvatarForm({ user }: Props) {
  const [avatarUrl, setAvatarUrl] = useState(user.avatar || "")
  const [preview, setPreview] = useState(user.avatar || "")
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [mode, setMode] = useState<"upload" | "url">("url")

  async function handleSave() {
    setMessage("")
    setError("")
    setSaving(true)
    try {
      await apiPut<any>("/api/v1/userpanel/profile", {
        avatar: avatarUrl || undefined,
      })
      setPreview(avatarUrl)
      setMessage("头像更新成功")
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(msg || "更新失败")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* 预览区 */}
      <div className="flex items-center gap-4">
        {preview ? (
          <img
            src={preview}
            alt="头像预览"
            className="size-16 sm:size-20 rounded-full border-2 border-white shadow-sm object-cover ring-1 ring-zinc-200"
          />
        ) : (
          <div className="flex items-center justify-center size-16 sm:size-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-2xl font-bold shadow-sm">
            {user.username.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <p className="text-sm font-medium text-zinc-900">当前头像</p>
          <p className="text-xs text-zinc-400 mt-0.5">支持 JPG、PNG、GIF 外链地址</p>
        </div>
      </div>

      {/* Tab 切换 */}
      <div className="flex gap-1 bg-zinc-100 rounded-lg p-0.5 w-fit">
        <button
          type="button"
          onClick={() => setMode("url")}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            mode === "url" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
          }`}
        >
          外链 URL
        </button>
        <button
          type="button"
          onClick={() => setMode("upload")}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            mode === "upload" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
          }`}
        >
          本地上传
        </button>
      </div>

      {/* 外链 URL 模式 */}
      {mode === "url" && (
        <div className="space-y-2">
          <Label htmlFor="avatar-url">头像链接</Label>
          <Input
            id="avatar-url"
            placeholder="https://example.com/avatar.jpg"
            value={avatarUrl}
            onChange={(e) => {
              setAvatarUrl(e.target.value)
              setPreview(e.target.value)
            }}
          />
        </div>
      )}

      {/* 本地上传模式 */}
      {mode === "upload" && (
        <div className="space-y-2">
          <Label htmlFor="avatar-file">选择文件</Label>
          <div className="flex items-center gap-3 p-4 border-2 border-dashed border-zinc-200 rounded-xl bg-zinc-50 text-center">
            <p className="text-xs text-zinc-400 flex-1">上传功能开发中，暂请使用外链方式设置头像</p>
          </div>
        </div>
      )}

      {message && <p className="text-xs text-emerald-600">{message}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}

      <Button onClick={handleSave} disabled={saving} size="sm">
        {saving ? "保存中..." : "保存设置"}
      </Button>
    </div>
  )
}
