"use client"

// modules/userpanel/settings/PasswordForm.tsx — 修改密码表单

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function PasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (newPassword !== confirmPassword) {
      setError("两次输入的新密码不一致")
      return
    }
    if (newPassword.length < 6) {
      setError("新密码长度不能少于 6 位")
      return
    }

    setSaving(true)
    try {
      // TODO: 后端密码修改 API 待实现
      await new Promise((r) => setTimeout(r, 500))
      setError("密码修改功能开发中，敬请期待")
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(msg || "修改失败")
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="pw-current">当前密码</Label>
        <Input
          id="pw-current"
          type="password"
          placeholder="请输入当前密码"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="pw-new">新密码</Label>
        <Input
          id="pw-new"
          type="password"
          placeholder="至少 6 位"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="pw-confirm">确认新密码</Label>
        <Input
          id="pw-confirm"
          type="password"
          placeholder="再次输入新密码"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <Button type="submit" disabled={saving} size="sm">
        {saving ? "修改中..." : "修改密码"}
      </Button>
    </form>
  )
}
