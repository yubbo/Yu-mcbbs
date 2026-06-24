"use client"

// modules/userpanel/settings/ProfileForm.tsx — 个人资料表单
// 对应后端: PUT /api/v1/userpanel/profile

import { useState } from "react"
import { apiPut } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { User } from "@/types"

interface Props {
  user: { id: number; username: string; email: string; nickname: string }
}

export function ProfileForm({ user }: Props) {
  const [email, setEmail] = useState(user.email || "")
  const [nickname, setNickname] = useState(user.nickname || "")
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMessage("")
    setError("")
    setSaving(true)

    try {
      await apiPut<User>("/api/v1/userpanel/profile", {
        email: email || undefined,
        nickname: nickname || undefined,
      })
      setMessage("保存成功")
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(msg || "保存失败")
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="profile-username">用户名</Label>
        <Input id="profile-username" value={user.username} disabled className="bg-zinc-50" />
        <p className="text-[10px] text-zinc-400">用户名不可修改</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="profile-email">邮箱</Label>
        <Input
          id="profile-email"
          type="email"
          placeholder="请输入邮箱"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="profile-nickname">昵称</Label>
        <Input
          id="profile-nickname"
          placeholder="请输入昵称"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
        />
      </div>

      {message && <p className="text-xs text-emerald-600">{message}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}

      <Button type="submit" disabled={saving} size="sm">
        {saving ? "保存中..." : "保存设置"}
      </Button>
    </form>
  )
}
