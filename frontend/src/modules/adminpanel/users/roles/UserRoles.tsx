"use client"

// modules/adminpanel/UserRoles.tsx — 用户权限管理

import { useEffect, useState, useCallback, useRef } from "react"
import { apiGet, apiPut } from "@/lib/api"
import { toast } from "sonner"
import type { User, PaginatedList } from "@/types"

const ROLES = ["user", "admin"] as const
const ROLE_LABELS: Record<string, string> = {
  user: "普通用户",
  admin: "管理员",
  super_admin: "超级管理员",
}

export function UserRoles() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [saving, setSaving] = useState<Record<string, boolean>>({})

  const mountedRef = useRef(true)

  const fetchUsers = useCallback(async (p: number) => {
    setLoading(true)
    try {
      const data = await apiGet<PaginatedList<User>>(
        `/api/v1/adminpanel/users?page=${p}&page_size=15`
      )
      if (!mountedRef.current) return
      setUsers(data.list || [])
      setTotalPages(data.total_pages || 1)
    } catch {
      if (!mountedRef.current) return
      toast.error("加载用户列表失败")
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    mountedRef.current = true
    fetchUsers(page)
    return () => { mountedRef.current = false }
  }, [page, fetchUsers])

  const updateRole = async (id: number, role: string) => {
    const key = `role-${id}`
    setSaving(prev => ({ ...prev, [key]: true }))
    try {
      await apiPut(`/api/v1/adminpanel/users/${id}`, { role })
      setUsers(prev => prev.map(u => u.id === id ? { ...u, role } : u))
      toast.success(`用户角色已更新为 ${ROLE_LABELS[role] || role}`)
    } catch (e) {
      toast.error("更新失败", { description: e instanceof Error ? e.message : "" })
    } finally {
      setSaving(prev => ({ ...prev, [key]: false }))
    }
  }

  const toggleStatus = async (id: number, current: number) => {
    const newStatus = current === 1 ? 0 : 1
    const key = `status-${id}`
    setSaving(prev => ({ ...prev, [key]: true }))
    try {
      await apiPut(`/api/v1/adminpanel/users/${id}`, { status: newStatus })
      setUsers(prev => prev.map(u => u.id === id ? { ...u, status: newStatus } : u))
      toast.success(newStatus === 1 ? "用户已启用" : "用户已禁用")
    } catch (e) {
      toast.error("操作失败", { description: e instanceof Error ? e.message : "" })
    } finally {
      setSaving(prev => ({ ...prev, [key]: false }))
    }
  }

  if (loading) {
    return <div className="text-center py-12 text-sm text-zinc-400">加载中...</div>
  }

  return (
    <div className="space-y-4">
      {/* 表格 */}
      <div className="bg-white rounded-xl border border-zinc-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/50">
                <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500">用户</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500">邮箱</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500">角色</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500">状态</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-zinc-500">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center justify-center size-8 rounded-full bg-zinc-100 text-xs font-medium text-zinc-500">
                        {user.nickname?.[0] || user.username?.[0] || "?"}
                      </span>
                      <div>
                        <div className="text-sm font-medium text-zinc-900">{user.nickname || user.username}</div>
                        <div className="text-xs text-zinc-400">@{user.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-xs text-zinc-600">{user.email}</td>
                  <td className="px-5 py-3">
                    <select
                      value={user.role}
                      onChange={e => updateRole(user.id, e.target.value)}
                      disabled={saving[`role-${user.id}`]}
                      className="text-xs border border-zinc-200 rounded-lg px-2.5 py-1.5 bg-white text-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 disabled:opacity-50"
                    >
                      {ROLES.map(r => (
                        <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                      user.status === 1 ? "text-emerald-600" : "text-zinc-400"
                    }`}>
                      <span className={`size-1.5 rounded-full ${
                        user.status === 1 ? "bg-emerald-400" : "bg-zinc-300"
                      }`} />
                      {user.status === 1 ? "正常" : "已禁用"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => toggleStatus(user.id, user.status!)}
                      disabled={saving[`status-${user.id}`]}
                      className={`text-xs px-3 py-1 rounded-lg transition-colors border-none cursor-pointer disabled:opacity-50 ${
                        user.status === 1
                          ? "text-red-600 bg-red-50 hover:bg-red-100"
                          : "text-emerald-600 bg-emerald-50 hover:bg-emerald-100"
                      }`}
                    >
                      {user.status === 1 ? "禁用" : "启用"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-zinc-500">
          <span>共 {totalPages} 页</span>
          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`px-2.5 py-1 rounded-md border-none cursor-pointer transition-colors ${
                  p === page
                    ? "bg-zinc-900 text-white"
                    : "bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
