"use client"

// modules/adminpanel/UserTable.tsx — 用户管理列表模块
// 对应 Go 后端: internal/handler/useradmin.go
// 功能：搜索、新建、编辑、封禁/启用、删除用户

import { useEffect, useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import type { User, PaginatedList } from "@/types"

const PAGE_SIZE = 12

// ── 常量配置 ────────────────────────────────────────────

const ROLE_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "全部角色" },
  { value: "super_admin", label: "超级管理员" },
  { value: "admin", label: "管理员" },
  { value: "super_moderator", label: "版主" },
  { value: "user", label: "普通用户" },
]

const STATUS_OPTIONS = [
  { value: "", label: "全部状态" },
  { value: "1", label: "正常" },
  { value: "0", label: "已禁用" },
]

const ADMIN_ROLES = [
  { value: "super_admin", label: "超级管理员" },
  { value: "admin", label: "管理员" },
  { value: "super_moderator", label: "版主" },
  { value: "user", label: "普通用户" },
]

const ROLE_STYLE: Record<string, string> = {
  super_admin: "bg-red-50 text-red-600 border-red-200",
  admin: "bg-blue-50 text-blue-600 border-blue-200",
  super_moderator: "bg-purple-50 text-purple-600 border-purple-200",
  user: "bg-zinc-50 text-zinc-600 border-zinc-200",
}

const ROLE_LABELS: Record<string, string> = {
  super_admin: "超级管理员",
  admin: "管理员",
  super_moderator: "版主",
  user: "普通用户",
}

// ── 主组件 ──────────────────────────────────────────────

export function UserTable() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  // 搜索条件
  const [keyword, setKeyword] = useState("")
  const [filterRole, setFilterRole] = useState("all")
  const [filterStatus, setFilterStatus] = useState("")

  // 弹窗
  const [showModal, setShowModal] = useState(false)
  const [editUser, setEditUser] = useState<User | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null)
  const [banTarget, setBanTarget] = useState<User | null>(null)

  const mountedRef = useRef(true)

  const fetchUsers = useCallback(async (p: number) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set("page", String(p))
      params.set("page_size", String(PAGE_SIZE))
      if (keyword) params.set("keyword", keyword)
      if (filterRole !== "all") params.set("role", filterRole)
      if (filterStatus) params.set("status", filterStatus)

      const data = await apiGet<PaginatedList<User>>(
        `/api/v1/adminpanel/users?${params.toString()}`
      )
      if (!mountedRef.current) return
      setUsers(data.list || [])
      setTotalPages(data.total_pages || 1)
      setTotal(data.total || 0)
    } catch {
      if (!mountedRef.current) return
      toast.error("加载用户列表失败")
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }, [keyword, filterRole, filterStatus])

  useEffect(() => {
    mountedRef.current = true
    fetchUsers(page)
    return () => { mountedRef.current = false }
  }, [page, fetchUsers])

  // 搜索时重置页码
  const handleSearch = () => {
    setPage(1)
    fetchUsers(1)
  }

  // 按钮事件
  const openCreate = () => { setEditUser(null); setShowModal(true) }
  const openEdit = (user: User) => { setEditUser(user); setShowModal(true) }
  const closeModal = () => { setShowModal(false); setEditUser(null) }
  const onSaved = () => { closeModal(); fetchUsers(page) }

  // 封禁/启用
  const toggleBan = async () => {
    if (!banTarget) return
    const newStatus = banTarget.status === 1 ? 0 : 1
    const actionLabel = newStatus === 0 ? "封禁" : "启用"
    try {
      await apiPut(`/api/v1/adminpanel/users/${banTarget.id}`, { status: newStatus })
      toast.success(`用户已${actionLabel}`)
      setBanTarget(null)
      fetchUsers(page)
    } catch (e) {
      toast.error(`操作失败`, { description: e instanceof Error ? e.message : "" })
    }
  }

  // 删除
  const confirmDelete = async () => {
    if (!deleteTarget) return
    try {
      await apiDelete(`/api/v1/adminpanel/users/${deleteTarget.id}`)
      toast.success("用户已删除")
      setDeleteTarget(null)
      fetchUsers(page)
    } catch (e) {
      toast.error("删除失败", { description: e instanceof Error ? e.message : "" })
    }
  }

  return (
    <div className="space-y-4">
      {/* ═══════════ 顶部操作栏 ═══════════ */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* 搜索框 */}
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-zinc-400" />
            <input
              type="text"
              placeholder="搜索用户名或邮箱..."
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              className="pl-9 pr-3 py-2 text-sm border border-zinc-200 rounded-lg w-52 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white placeholder:text-zinc-400"
            />
          </div>

          {/* 角色筛选 */}
          <select
            value={filterRole}
            onChange={e => { setFilterRole(e.target.value); setPage(1) }}
            className="text-sm border border-zinc-200 rounded-lg px-3 py-2 bg-white text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
          >
            {ROLE_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          {/* 状态筛选 */}
          <select
            value={filterStatus}
            onChange={e => { setFilterStatus(e.target.value); setPage(1) }}
            className="text-sm border border-zinc-200 rounded-lg px-3 py-2 bg-white text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
          >
            {STATUS_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          {/* 搜索按钮 */}
          <button
            onClick={handleSearch}
            className="px-4 py-2 text-sm text-zinc-600 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors cursor-pointer"
          >
            搜索
          </button>
        </div>

        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors border-none cursor-pointer shadow-sm"
        >
          <PlusIcon className="size-4" />
          添加用户
        </button>
      </div>

      {/* ═══════════ 表格 ═══════════ */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50">
                <Th>序号</Th>
                <Th>UID</Th>
                <Th>用户名</Th>
                <Th>邮箱</Th>
                <Th>角色</Th>
                <Th>状态</Th>
                <Th>注册时间</Th>
                <Th align="right">操作</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-sm text-zinc-400">
                    <LoadingDots />
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-sm text-zinc-400">
                    暂无用户数据
                  </td>
                </tr>
              ) : (
                users.map((user, idx) => (
                  <tr key={user.id} className="hover:bg-zinc-50/60 transition-colors">
                    {/* 序号 */}
                    <Td muted>{((page - 1) * PAGE_SIZE) + idx + 1}</Td>

                    {/* UID */}
                    <Td mono>{user.id}</Td>

                    {/* 用户名 */}
                    <Td>
                      <div className="flex items-center gap-3">
                        {/* 头像 */}
                        <span className="flex items-center justify-center size-8 rounded-full bg-blue-600 text-xs font-semibold text-white shrink-0">
                          {user.nickname?.[0] || user.username?.[0] || "?"}
                        </span>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-zinc-900 truncate max-w-[140px]">
                            {user.nickname || user.username}
                          </div>
                          <div className="text-xs text-zinc-400">@{user.username}</div>
                        </div>
                      </div>
                    </Td>

                    {/* 邮箱 */}
                    <Td muted>{user.email || "-"}</Td>

                    {/* 角色 */}
                    <Td>
                      <span className={cn(
                        "inline-flex text-[11px] px-2.5 py-0.5 rounded border font-medium",
                        ROLE_STYLE[user.role] || "bg-zinc-50 text-zinc-600 border-zinc-200"
                      )}>
                        {ROLE_LABELS[user.role] || user.role}
                      </span>
                    </Td>

                    {/* 状态 */}
                    <Td>
                      <span className={cn(
                        "inline-flex items-center gap-1.5 text-xs font-medium",
                        user.status === 1 ? "text-emerald-600" : "text-zinc-400"
                      )}>
                        <span className={cn(
                          "size-1.5 rounded-full",
                          user.status === 1 ? "bg-emerald-400" : "bg-zinc-300"
                        )} />
                        {user.status === 1 ? "正常" : "已禁用"}
                      </span>
                    </Td>

                    {/* 注册时间 */}
                    <Td muted>{formatDate(user.created_at)}</Td>

                    {/* 操作 */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* 详情 */}
                        <button
                          onClick={() => router.push(`/admin/users/${user.id}`)}
                          className={actionBtnStyle}
                          title="详情"
                        >
                          详情
                        </button>
                        {/* 编辑 */}
                        <button
                          onClick={() => openEdit(user)}
                          className={actionBtnStyle}
                          title="编辑"
                        >
                          编辑
                        </button>
                        {/* 封禁/启用 */}
                        <button
                          onClick={() => setBanTarget(user)}
                          className={cn(
                            actionBtnStyle,
                            user.status === 1
                              ? "hover:text-orange-600 hover:bg-orange-50"
                              : "hover:text-emerald-600 hover:bg-emerald-50"
                          )}
                          title={user.status === 1 ? "封禁" : "启用"}
                        >
                          {user.status === 1 ? "封禁" : "启用"}
                        </button>
                        {/* 删除 */}
                        <button
                          onClick={() => setDeleteTarget(user)}
                          className={cn(actionBtnStyle, "hover:text-red-600 hover:bg-red-50")}
                          title="删除"
                        >
                          删除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ═══════════ 底部分页 ═══════════ */}
      <div className="flex items-center justify-between text-xs text-zinc-500">
        <span>共 {total} 条记录，第 {page}/{totalPages} 页</span>
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 rounded-md border border-zinc-200 bg-white hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-600 cursor-pointer text-xs"
            >
              上一页
            </button>
            {renderPageNumbers(page, totalPages, setPage)}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1.5 rounded-md border border-zinc-200 bg-white hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-600 cursor-pointer text-xs"
            >
              下一页
            </button>
          </div>
        )}
      </div>

      {/* ═══════════ 新增/编辑弹窗 ═══════════ */}
      {showModal && (
        <UserFormModal
          user={editUser}
          onClose={closeModal}
          onSaved={onSaved}
          saving={saving}
          setSaving={setSaving}
        />
      )}

      {/* ═══════════ 封禁/启用确认弹窗 ═══════════ */}
      {banTarget && (
        <ConfirmDialog
          title={banTarget.status === 1 ? "封禁用户" : "启用用户"}
          message={
            banTarget.status === 1
              ? `确定要封禁用户「${banTarget.nickname || banTarget.username}」吗？封禁后该用户将无法登录和使用网站功能。`
              : `确定要启用用户「${banTarget.nickname || banTarget.username}」吗？启用后该用户将恢复正常使用。`
          }
          onConfirm={toggleBan}
          onCancel={() => setBanTarget(null)}
          confirmLabel={banTarget.status === 1 ? "确认封禁" : "确认启用"}
          danger={banTarget.status === 1}
        />
      )}

      {/* ═══════════ 删除确认弹窗 ═══════════ */}
      {deleteTarget && (
        <ConfirmDialog
          title="删除用户"
          message={`确定要删除用户「${deleteTarget.nickname || deleteTarget.username}」吗？此操作为软删除，可联系管理员恢复。`}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
          confirmLabel="确认删除"
          danger
        />
      )}
    </div>
  )
}

// ── 表格子组件 ──────────────────────────────────────────

const actionBtnStyle = "px-2 py-1 text-xs text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 rounded transition-colors border-none cursor-pointer bg-transparent"

function Th({ children, align }: { children: React.ReactNode; align?: "left" | "right" }) {
  return (
    <th className={cn(
      "px-4 py-3 text-xs font-medium text-zinc-500 whitespace-nowrap",
      align === "right" ? "text-right" : "text-left"
    )}>
      {children}
    </th>
  )
}

function Td({ children, muted, mono }: { children: React.ReactNode; muted?: boolean; mono?: boolean }) {
  return (
    <td className={cn(
      "px-4 py-3 text-sm whitespace-nowrap",
      muted && "text-zinc-400",
      mono && "text-xs text-zinc-400 font-mono"
    )}>
      {children}
    </td>
  )
}

// ── 分页渲染 ────────────────────────────────────────────

function renderPageNumbers(
  current: number,
  total: number,
  setPage: (p: number) => void
) {
  const pages: (number | "...")[] = []
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    pages.push(1)
    if (current > 3) pages.push("...")
    const start = Math.max(2, current - 1)
    const end = Math.min(total - 1, current + 1)
    for (let i = start; i <= end; i++) pages.push(i)
    if (current < total - 2) pages.push("...")
    pages.push(total)
  }

  return pages.map((p, i) =>
    p === "..." ? (
      <span key={`dots-${i}`} className="px-1.5 text-zinc-300">...</span>
    ) : (
      <button
        key={p}
        onClick={() => setPage(p as number)}
        className={cn(
          "size-7 rounded-md border-none cursor-pointer text-xs transition-colors",
          p === current
            ? "bg-blue-600 text-white font-medium"
            : "bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50"
        )}
      >
        {p}
      </button>
    )
  )
}

// ── 用户表单弹窗 ────────────────────────────────────────

function UserFormModal({
  user,
  onClose,
  onSaved,
  saving,
  setSaving,
}: {
  user: User | null
  onClose: () => void
  onSaved: () => void
  saving: boolean
  setSaving: (v: boolean) => void
}) {
  const isEdit = !!user
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
  }, [])

  const handleClose = () => {
    setVisible(false)
    setTimeout(() => onClose(), 200)
  }
  const [form, setForm] = useState({
    username: user?.username || "",
    email: user?.email || "",
    password: "",
    nickname: user?.nickname || "",
    role: user?.role || "user",
    status: String(user?.status ?? 1),
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (!isEdit && !form.username.trim()) errs.username = "请输入用户名"
    if (!isEdit && form.username.length < 3) errs.username = "用户名至少 3 个字符"
    if (!isEdit && !form.email.trim()) errs.email = "请输入邮箱"
    if (!isEdit && !form.password.trim()) errs.password = "请输入密码"
    if (!isEdit && form.password.length < 6) errs.password = "密码至少 6 个字符"
    if (isEdit && form.password && form.password.length < 6) errs.password = "密码至少 6 个字符（留空则不修改）"
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    try {
      if (isEdit) {
        const body: Record<string, unknown> = {}
        if (form.email !== user.email) body.email = form.email
        if (form.nickname !== user.nickname) body.nickname = form.nickname
        if (form.role !== user.role) body.role = form.role
        if (String(form.status) !== String(user.status)) body.status = Number(form.status)
        if (form.password) body.password = form.password
        await apiPut(`/api/v1/adminpanel/users/${user.id}`, body)
        toast.success("用户信息已更新")
      } else {
        await apiPost("/api/v1/adminpanel/users", {
          username: form.username,
          email: form.email,
          password: form.password,
          nickname: form.nickname,
          role: form.role,
          status: Number(form.status),
        })
        toast.success("用户创建成功")
      }
      onSaved()
    } catch (e) {
      toast.error(isEdit ? "更新失败" : "创建失败", {
        description: e instanceof Error ? e.message : "",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center modal-overlay-2 ${visible ? "show" : ""}`}>
      <div className="absolute inset-0 bg-black/40" onClick={handleClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md p-6 modal-content-2">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold text-zinc-900">
            {isEdit ? "编辑用户" : "添加用户"}
          </h3>
          <button onClick={handleClose} className="text-zinc-400 hover:text-zinc-600 transition-colors border-none bg-transparent cursor-pointer p-1 rounded-lg hover:bg-zinc-100">
            <XIcon className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="用户名" error={errors.username} required={!isEdit}>
            <input
              type="text"
              value={form.username}
              onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
              disabled={isEdit}
              className={inputClass(isEdit, !!errors.username)}
            />
          </FormField>

          <FormField label="邮箱" error={errors.email} required={!isEdit}>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              className={inputClass(false, !!errors.email)}
            />
          </FormField>

          <FormField label={isEdit ? "密码（留空不修改）" : "密码"} error={errors.password} required={!isEdit}>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              className={inputClass(false, !!errors.password)}
            />
          </FormField>

          <FormField label="昵称">
            <input
              type="text"
              value={form.nickname}
              onChange={e => setForm(p => ({ ...p, nickname: e.target.value }))}
              className={inputClass(false)}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="角色">
              <select
                value={form.role}
                onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg bg-white text-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
              >
                {ADMIN_ROLES.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </FormField>

            <FormField label="状态">
              <select
                value={form.status}
                onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg bg-white text-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
              >
                <option value="1">正常</option>
                <option value="0">已禁用</option>
              </select>
            </FormField>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm text-zinc-600 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors cursor-pointer"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 border-none cursor-pointer shadow-sm"
            >
              {saving ? "保存中..." : isEdit ? "保存" : "创建"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function inputClass(disabled: boolean, error?: boolean) {
  return cn(
    "w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400",
    disabled ? "bg-zinc-50 text-zinc-500" : "bg-white",
    error ? "border-red-300" : "border-zinc-200"
  )
}

// ── 确认弹窗 ────────────────────────────────────────────

function ConfirmDialog({
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel,
  danger,
}: {
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
  confirmLabel: string
  danger?: boolean
}) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
  }, [])

  const handleClose = () => {
    setVisible(false)
    setTimeout(() => onCancel(), 200)
  }

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center modal-overlay-2 ${visible ? "show" : ""}`}>
      <div className="absolute inset-0 bg-black/40" onClick={handleClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 modal-content-2">
        <div className="flex items-center gap-3 mb-4">
          <span className={cn(
            "flex items-center justify-center size-9 rounded-full",
            danger ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
          )}>
            <AlertIcon className="size-4" />
          </span>
          <h3 className="text-base font-semibold text-zinc-900">{title}</h3>
        </div>
        <p className="text-sm text-zinc-500 mb-6 leading-relaxed">{message}</p>
        <div className="flex justify-end gap-2">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm text-zinc-600 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors cursor-pointer"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            className={cn(
              "px-4 py-2 text-sm text-white rounded-lg transition-colors border-none cursor-pointer",
              danger ? "bg-red-500 hover:bg-red-600" : "bg-blue-600 hover:bg-blue-700"
            )}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── 表单字段 ────────────────────────────────────────────

function FormField({
  label,
  children,
  error,
  required,
}: {
  label: string
  children: React.ReactNode
  error?: string
  required?: boolean
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-zinc-700 mb-1.5">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}

// ── 工具函数 & 图标 ────────────────────────────────────

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
  } catch {
    return dateStr
  }
}

function LoadingDots() {
  return (
    <span className="inline-flex gap-1">
      <span className="size-1.5 rounded-full bg-zinc-300 animate-pulse" />
      <span className="size-1.5 rounded-full bg-zinc-300 animate-pulse" style={{ animationDelay: "0.15s" }} />
      <span className="size-1.5 rounded-full bg-zinc-300 animate-pulse" style={{ animationDelay: "0.3s" }} />
    </span>
  )
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function AlertIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
}
