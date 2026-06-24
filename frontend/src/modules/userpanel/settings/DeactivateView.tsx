"use client"

// modules/userpanel/settings/DeactivateView.tsx — 账号注销

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Props {
  username: string
}

export function DeactivateView({ username }: Props) {
  const [confirm, setConfirm] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleDeactivate() {
    if (confirm !== username) return
    setLoading(true)
    try {
      await new Promise((r) => setTimeout(r, 500))
      alert("账号注销功能开发中")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="p-4 rounded-xl border border-red-200 bg-red-50">
        <div className="flex items-center gap-2 mb-2">
          <svg className="size-4 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <h3 className="text-sm font-semibold text-red-700">危险操作</h3>
        </div>
        <p className="text-xs text-red-600 leading-relaxed">
          注销账号后，你的所有数据将被永久删除且不可恢复。此操作不可撤销，请谨慎操作。
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="deactivate-confirm">
          请输入用户名 <span className="font-semibold text-zinc-900">{username}</span> 以确认
        </Label>
        <Input
          id="deactivate-confirm"
          placeholder="请输入用户名确认"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
      </div>

      <Button
        variant="destructive"
        disabled={confirm !== username || loading}
        onClick={handleDeactivate}
        size="sm"
      >
        {loading ? "处理中..." : "注销账号"}
      </Button>

      <p className="text-xs text-zinc-400">
        账号注销功能正在开发中
      </p>
    </div>
  )
}
