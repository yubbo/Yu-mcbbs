"use client"

// modules/adminpanel/dashboard/Dashboard.tsx — 管理后台仪表盘模块
// 对应 Go 后端: internal/handler/useradmin.go, internal/handler/settings.go

import { useEffect, useState } from "react"
import Link from "next/link"
import { apiGet, apiPut } from "@/lib/api"
import { toast } from "sonner"
import type { PaginatedList, User } from "@/types"

interface DashboardStats {
  totalUsers: number
  totalForums: number
  activeToday: number
}

interface SettingItem {
  id: number
  key: string
  value: string
  label: string
  group: string
  editable: boolean
}

const quickLinks = [
  { label: "用户管理", href: "/admin/users", desc: "查看和管理所有注册用户", color: "blue", icon: UsersIcon },
  { label: "版块管理", href: "/admin/bbs/forums", desc: "创建和编辑论坛版块", color: "emerald", icon: LayersIcon },
  { label: "站点信息", href: "/admin/settings/global/site", desc: "修改站点名称与描述", color: "violet", icon: GlobeIcon },
  { label: "导航管理", href: "/admin/settings/ui/navigation/main", desc: "配置前台主导航", color: "amber", icon: CompassIcon },
  { label: "主题", href: "/admin/settings/ui/theme", desc: "管理主题与外观设置", color: "rose", icon: PaletteIcon },
  { label: "插件", href: "/admin/plugins", desc: "安装与管理功能插件", color: "cyan", icon: PuzzleIcon },
]

const colorMap: Record<string, { bg: string; text: string; border: string; soft: string }> = {
  blue:    { bg: "bg-blue-500", text: "text-blue-600", border: "border-blue-200", soft: "bg-blue-50" },
  emerald: { bg: "bg-emerald-500", text: "text-emerald-600", border: "border-emerald-200", soft: "bg-emerald-50" },
  violet:  { bg: "bg-violet-500", text: "text-violet-600", border: "border-violet-200", soft: "bg-violet-50" },
  amber:   { bg: "bg-amber-500", text: "text-amber-600", border: "border-amber-200", soft: "bg-amber-50" },
  rose:    { bg: "bg-rose-500", text: "text-rose-600", border: "border-rose-200", soft: "bg-rose-50" },
  cyan:    { bg: "bg-cyan-500", text: "text-cyan-600", border: "border-cyan-200", soft: "bg-cyan-50" },
}

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({ totalUsers: 0, totalForums: 0, activeToday: 0 })
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState<Record<string, SettingItem[]>>({})
  const [toggling, setToggling] = useState(false)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [userResult, settingsResult] = await Promise.allSettled([
          apiGet<PaginatedList<User>>("/api/v1/adminpanel/users?page=1&page_size=1"),
          apiGet<Record<string, SettingItem[]>>("/api/v1/adminpanel/settings"),
        ])
        if (userResult.status === "fulfilled") {
          setStats(prev => ({ ...prev, totalUsers: userResult.value.total ?? 0 }))
        }
        if (settingsResult.status === "fulfilled") {
          setSettings(settingsResult.value)
        }
      } catch {
        console.error("[Dashboard] 加载统计数据失败")
      }
      finally { setLoading(false) }
    }
    fetchAll()
  }, [])

  const toggleLayoutMode = async () => {
    const layoutItems = settings.layout || []
    const layoutMode = layoutItems.find(s => s.key === "layout_mode")
    const newVal = layoutMode?.value === "wide" ? "narrow" : "wide"
    setToggling(true)
    try {
      await apiPut(`/api/v1/adminpanel/settings/layout_mode`, { value: newVal })
      setSettings(prev => ({
        ...prev,
        layout: (prev.layout || []).map(s =>
          s.key === "layout_mode" ? { ...s, value: newVal } : s
        ),
      }))
      toast.success(newVal === "wide" ? "已切换为宽屏模式" : "已切换为窄屏模式")
    } catch (e) {
      toast.error("切换失败", { description: e instanceof Error ? e.message : "" })
    } finally { setToggling(false) }
  }

  const toggleRedis = async () => {
    const cacheItems = settings.cache || []
    const redisEnabled = cacheItems.find(s => s.key === "redis_enabled")
    if (!redisEnabled) return
    const newVal = redisEnabled.value === "true" ? "false" : "true"
    setToggling(true)
    try {
      await apiPut(`/api/v1/adminpanel/settings/redis_enabled`, { value: newVal })
      setSettings(prev => ({
        ...prev,
        cache: (prev.cache || []).map(s =>
          s.key === "redis_enabled" ? { ...s, value: newVal } : s
        ),
      }))
      toast.success(newVal === "true" ? "Redis 已开启" : "Redis 已关闭")
    } catch (e: unknown) {
      toast.error("切换失败", { description: e instanceof Error ? e.message : "" })
    } finally { setToggling(false) }
  }

  const getSetting = (group: string, key: string) =>
    (settings[group] || []).find(s => s.key === key)?.value || "—"

  const siteName = getSetting("site", "site_name")
  const siteDesc = getSetting("site", "site_desc")
  const dbType = getSetting("database", "db_type")
  const dbHost = getSetting("database", "db_host")
  const dbName = getSetting("database", "db_name")
  const tablePrefix = getSetting("database", "table_prefix")
  const redisEnabled = getSetting("cache", "redis_enabled") === "true"
  const redisHost = getSetting("cache", "redis_host")
  const installTime = getSetting("system", "install_time")
  const themeActive = getSetting("site", "theme_active")
  const layoutMode = getSetting("layout", "layout_mode")
  const goVersion = getSetting("system", "go_version")

  return (
    <div className="space-y-6">
      {/* 欢迎横幅 */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-6 text-white">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px), radial-gradient(circle at 40% 80%, white 1px, transparent 1px)",
            backgroundSize: "60px 60px, 80px 80px, 50px 50px",
          }}
        />
        <div className="relative flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">{siteName !== "—" ? siteName : "BBS CMS"}</h1>
            <p className="text-sm text-zinc-400 mt-1.5 max-w-md">
              {siteDesc !== "—" ? siteDesc : "欢迎回来，这是你的站点管理中心"}
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-3 text-xs text-zinc-400">
            <span className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-emerald-400" />
              运行中
            </span>
            <span>·</span>
            <span>Go {goVersion}</span>
          </div>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard icon={<UsersIcon className="size-4" />} label="注册用户" value={loading ? "—" : stats.totalUsers.toLocaleString()} href="/admin/users" color="blue" trend="+12%" />
        <StatCard icon={<LayersIcon className="size-4" />} label="论坛版块" value={loading ? "—" : stats.totalForums.toLocaleString()} href="/admin/bbs/forums" color="emerald" />
        <StatCard icon={<ActivityIcon className="size-4" />} label="今日活跃" value={loading ? "—" : stats.activeToday.toLocaleString()} href="/admin/users" color="violet" />
      </div>

      {/* 系统信息 & 快捷操作 */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-white rounded-xl border border-zinc-200/80 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-zinc-100">
            <h2 className="text-sm font-semibold text-zinc-900">系统信息</h2>
          </div>
          <div className="divide-y divide-zinc-50">
            <SystemRow label="数据库" icon={<DatabaseIcon className="size-3.5" />}>
              <span className="text-xs text-zinc-600">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 font-medium text-[11px]">{dbType}</span>
                <span className="mx-1.5 text-zinc-300">|</span>
                {dbHost} / {dbName}
              </span>
            </SystemRow>
            <SystemRow label="表前缀" icon={<HashIcon className="size-3.5" />}>
              <code className="text-[11px] px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 font-mono">{tablePrefix}</code>
            </SystemRow>
            <SystemRow label="当前主题" icon={<PaletteIcon className="size-3.5" />}>
              <span className="text-xs text-zinc-600">{themeActive}</span>
            </SystemRow>
            <SystemRow label="安装时间" icon={<ClockIcon className="size-3.5" />}>
              <span className="text-xs text-zinc-500">{installTime}</span>
            </SystemRow>
            <SystemRow label="Redis 缓存" icon={<ZapIcon className="size-3.5" />}>
              <div className="flex items-center gap-2.5">
                <span className="inline-flex items-center gap-1">
                  <span className={`size-1.5 rounded-full ${redisEnabled ? "bg-emerald-400" : "bg-zinc-300"}`} />
                  <span className={`text-xs font-medium ${redisEnabled ? "text-emerald-600" : "text-zinc-400"}`}>
                    {redisEnabled ? `已开启 · ${redisHost}` : "已关闭"}
                  </span>
                </span>
                <ToggleSwitch checked={redisEnabled} onChange={toggleRedis} disabled={toggling} color="emerald" />
              </div>
            </SystemRow>
            <SystemRow label="运行环境" icon={<TerminalIcon className="size-3.5" />}>
              <span className="text-xs text-zinc-500">Go {goVersion}</span>
            </SystemRow>
            <SystemRow label="页面宽度" icon={<MaximizeIcon className="size-3.5" />}>
              <div className="flex items-center gap-2.5">
                <span className={`text-xs font-medium ${layoutMode === "wide" ? "text-blue-600" : "text-zinc-500"}`}>
                  {layoutMode === "wide" ? "宽屏" : "窄屏"}
                </span>
                <ToggleSwitch checked={layoutMode === "wide"} onChange={toggleLayoutMode} disabled={toggling} color="blue" />
              </div>
            </SystemRow>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-zinc-200/80 shadow-sm">
          <div className="px-5 py-3.5 border-b border-zinc-100">
            <h2 className="text-sm font-semibold text-zinc-900">快捷操作</h2>
          </div>
          <div className="p-3 space-y-1">
            <QuickAction href="/admin/settings/global/site" label="修改站点信息" />
            <QuickAction href="/admin/bbs/forums" label="管理论坛版块" />
            <QuickAction href="/admin/settings/ui/theme" label="更换主题" />
            <QuickAction href="/admin/plugins" label="安装插件" />
            <QuickAction href="/" label="访问前台" external />
          </div>
        </div>
      </div>

      {/* 快捷入口卡片 */}
      <div>
        <h2 className="text-sm font-semibold text-zinc-900 mb-3">功能入口</h2>
        <div className="grid grid-cols-3 gap-3">
          {quickLinks.map(link => {
            const c = colorMap[link.color]
            const Icon = link.icon
            return (
              <Link key={link.href} href={link.href}
                className={`group flex items-start gap-3 p-4 rounded-xl border ${c.border} ${c.soft} hover:shadow-sm transition-all no-underline`}
              >
                <span className={`flex items-center justify-center size-9 rounded-lg ${c.bg} text-white shrink-0`}>
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0">
                  <span className={`block text-sm font-medium ${c.text}`}>{link.label}</span>
                  <span className="block text-xs text-zinc-500 mt-0.5">{link.desc}</span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── 子组件 ─────────────────────────────────────────────

function StatCard({ icon, label, value, href, color, trend }: {
  icon: React.ReactNode; label: string; value: string; href: string; color: string; trend?: string
}) {
  const c = colorMap[color]
  return (
    <Link href={href}
      className={`group relative overflow-hidden rounded-xl border ${c.border} ${c.soft} p-4 hover:shadow-sm transition-all no-underline`}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-2xl font-bold text-zinc-900 tabular-nums">{value}</div>
          <div className="text-xs text-zinc-500 mt-1">{label}</div>
          {trend && (
            <span className="inline-flex items-center gap-0.5 text-[11px] text-emerald-600 mt-1.5">
              <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="18 15 12 9 6 15" />
              </svg>
              {trend}
            </span>
          )}
        </div>
        <span className={`flex items-center justify-center size-9 rounded-lg ${c.bg} text-white opacity-80 group-hover:opacity-100 transition-opacity`}>
          {icon}
        </span>
      </div>
    </Link>
  )
}

function SystemRow({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-5 py-3">
      <div className="flex items-center gap-2.5 text-zinc-500">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <div className="flex items-center">{children}</div>
    </div>
  )
}

function ToggleSwitch({ checked, onChange, disabled, color }: {
  checked: boolean; onChange: () => void; disabled: boolean; color: string
}) {
  const bgOn = color === "emerald" ? "bg-emerald-500" : "bg-blue-500"
  return (
    <button onClick={onChange} disabled={disabled}
      className={`relative w-8 h-4.5 rounded-full transition-colors cursor-pointer border-none ${checked ? bgOn : "bg-zinc-300"}`}
    >
      <span className={`absolute top-0.5 size-3.5 rounded-full bg-white shadow-sm transition-transform ${checked ? "left-4" : "left-0.5"}`} />
    </button>
  )
}

function QuickAction({ href, label, external }: { href: string; label: string; external?: boolean }) {
  const cls = "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors no-underline"
  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={cls}>
        <ExternalLinkIcon className="size-3.5 shrink-0" />
        {label}
      </a>
    )
  }
  return (
    <Link href={href} className={cls}>
      <ChevronRightIcon className="size-3.5 shrink-0 text-zinc-400" />
      {label}
    </Link>
  )
}

// ── SVG 图标 ───────────────────────────────────────────

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function LayersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
      <line x1="12" y1="22" x2="12" y2="15.5" /><polyline points="22 8.5 12 15.5 2 8.5" />
    </svg>
  )
}

function ActivityIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  )
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  )
}

function CompassIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  )
}

function PaletteIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="13.5" cy="6.5" r="1.5" /><circle cx="17.5" cy="10.5" r="1.5" /><circle cx="8.5" cy="7.5" r="1.5" /><circle cx="6.5" cy="12.5" r="1.5" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-1 0-.83.67-1.5 1.5-1.5H16c3.31 0 6-2.69 6-6 0-5.5-4.5-10-10-10z" />
    </svg>
  )
}

function PuzzleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19.44 11.95c.34-.58.56-1.23.56-1.95a3 3 0 0 0-6 0c0 .72.22 1.37.56 1.95" />
      <path d="M14.4 4.9c.4-.66 1.04-1.1 1.8-1.3a3 3 0 0 1 3.2 3.2 2.99 2.99 0 0 1-1.3 1.8" />
      <path d="M9.1 19.4a3 3 0 0 1-1.3 1.8 3 3 0 0 1-4.5-4.5 3 3 0 0 1 1.8-1.3" />
      <path d="M4.9 9.1a3 3 0 0 1-1.3-1.8 3 3 0 0 1 3.2-3.2c.76.2 1.4.64 1.8 1.3" />
      <path d="M11.95 4.56c-.58-.34-1.23-.56-1.95-.56a3 3 0 1 0 0 6c.72 0 1.37-.22 1.95-.56" />
      <path d="M19.1 14.4a3 3 0 0 1 1.8 1.3 3 3 0 0 1-3.2 3.2 3 3 0 0 1-1.3-1.8" />
      <rect x="9" y="9" width="6" height="6" rx="1" />
    </svg>
  )
}

function DatabaseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </svg>
  )
}

function HashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="9" x2="20" y2="9" /><line x1="4" y1="15" x2="20" y2="15" />
      <line x1="10" y1="3" x2="8" y2="21" /><line x1="16" y1="3" x2="14" y2="21" />
    </svg>
  )
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

function ZapIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  )
}

function TerminalIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  )
}

function MaximizeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" />
      <line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" />
    </svg>
  )
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  )
}
