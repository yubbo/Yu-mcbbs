"use client"

// app/(adminpanel)/admin/users/[id]/page.tsx — 用户编辑页
// 对应 Go 后端: GET/PUT/DELETE /api/v1/adminpanel/users/:id

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { apiGet, apiPut, apiDelete } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import type { User } from "@/types"

export default function UserEditPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [nickname, setNickname] = useState("")
  const [email, setEmail] = useState("")
  const [role, setRole] = useState("")
  const [status, setStatus] = useState(1)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    apiGet<User>(`/api/v1/adminpanel/users/${id}`)
      .then((data) => {
        setUser(data)
        setNickname(data.nickname || "")
        setEmail(data.email)
        setRole(data.role)
        setStatus(data.status)
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err)
        setError(msg)
      })
      .finally(() => setLoading(false))
  }, [id])

  const handleSave = async () => {
    setSaving(true)
    setError("")
    try {
      await apiPut(`/api/v1/adminpanel/users/${id}`, {
        email,
        nickname,
        role,
        status,
      })
      router.push("/admin/users")
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("确定要删除该用户吗？")) return
    setDeleting(true)
    setError("")
    try {
      await apiDelete(`/api/v1/adminpanel/users/${id}`)
      router.push("/admin/users")
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(msg)
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return <p className="text-muted-foreground p-6">加载中...</p>
  if (!user) return <p className="text-destructive p-6">{error || "用户不存在"}</p>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">编辑用户 #{user.id}</h1>
        <Button variant="outline" onClick={() => router.push("/admin/users")}>
          返回列表
        </Button>
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}

      <Card>
        <CardHeader>
          <CardTitle>基本信息</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>用户名</Label>
            <Input value={user.username} disabled className="bg-muted" />
          </div>
          <div>
            <Label>邮箱</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <Label>昵称</Label>
            <Input value={nickname} onChange={(e) => setNickname(e.target.value)} />
          </div>
          <div>
            <Label>角色</Label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="user">user</option>
              <option value="super_moderator">super_moderator</option>
              <option value="admin">admin</option>
              <option value="super_admin">super_admin</option>
            </select>
          </div>
          <div>
            <Label>状态</Label>
            <select
              value={status}
              onChange={(e) => setStatus(Number(e.target.value))}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value={1}>正常</option>
              <option value={0}>禁用</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "保存中..." : "保存修改"}
        </Button>
        <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
          {deleting ? "删除中..." : "删除用户"}
        </Button>
      </div>
    </div>
  )
}
