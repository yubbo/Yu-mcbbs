"use client"

// modules/adminpanel/plugins/PluginManager.tsx — 插件管理
// 已安装列表 + 应用中心双标签

import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api"

interface Plugin {
  id: number
  name: string
  title: string
  version: string
  description: string
  author: string
  active: boolean
}

interface MarketItem {
  id: string
  name: string
  title: string
  version: string
  description: string
  author: string
  downloads: number
  rating: number
  price: string
  category: string
  hooks: string[]
}

interface MarketData {
  items: MarketItem[]
  installed: Record<string, boolean>
  categories: string[]
}

export function PluginManager() {
  const [plugins, setPlugins] = useState<Plugin[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<"installed" | "market">("installed")

  const fetchPlugins = useCallback(async () => {
    try {
      const data = await apiGet<Plugin[]>("/api/v1/adminpanel/plugins")
      setPlugins(data || [])
    } catch { toast.error("获取插件列表失败") }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchPlugins() }, [fetchPlugins])

  const handleToggle = async (name: string, active: boolean) => {
    try {
      await apiPut(`/api/v1/adminpanel/plugins/${name}/toggle`, { active: !active })
      setPlugins((prev) => prev.map((p) => p.name === name ? { ...p, active: !active } : p))
      toast.success(active ? "已停用" : "已启用")
    } catch { toast.error("操作失败") }
  }

  const handleUninstall = async (name: string) => {
    if (!confirm(`确定卸载插件 "${name}" 吗？`)) return
    try {
      await apiDelete(`/api/v1/adminpanel/plugins/${name}`)
      setPlugins((prev) => prev.filter((p) => p.name !== name))
      toast.success("已卸载")
    } catch { toast.error("卸载失败") }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">插件</h1>
        <p className="text-sm text-zinc-500 mt-1">管理站点插件，扩展论坛功能</p>
      </div>

      <div className="flex border-b border-zinc-200">
        <button
          onClick={() => setTab("installed")}
          className={`px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer bg-transparent border-none border-b-2 ${
            tab === "installed" ? "border-zinc-900 text-zinc-900" : "border-transparent text-zinc-400 hover:text-zinc-600"
          }`}
        >已安装</button>
        <button
          onClick={() => setTab("market")}
          className={`px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer bg-transparent border-none border-b-2 ${
            tab === "market" ? "border-zinc-900 text-zinc-900" : "border-transparent text-zinc-400 hover:text-zinc-600"
          }`}
        >应用中心</button>
      </div>

      {tab === "installed" ? (
        loading ? (
          <div className="flex items-center justify-center py-12">
            <svg className="size-6 text-zinc-400 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
            <span className="ml-2 text-sm text-zinc-400">加载中...</span>
          </div>
        ) : plugins.length === 0 ? (
          <div className="text-center py-12">
            <div className="size-16 rounded-2xl bg-zinc-100 flex items-center justify-center mx-auto mb-3">
              <svg className="size-8 text-zinc-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M12 3a4 4 0 110 8 4 4 0 010-8z"/></svg>
            </div>
            <p className="text-sm text-zinc-500">暂无已安装的插件</p>
            <p className="text-xs text-zinc-400 mt-1">前往应用中心安装插件</p>
          </div>
        ) : (
          <div className="space-y-3">
            {plugins.map((p) => (
              <div key={p.name} className="flex items-center justify-between p-4 rounded-xl border border-zinc-200 bg-white">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-sm text-zinc-900">{p.title}</h3>
                    <span className="text-[10px] text-zinc-400">{p.version}</span>
                    {p.active && <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-medium">已启用</span>}
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5">{p.description}</p>
                  <p className="text-[10px] text-zinc-400 mt-1">{p.author}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleToggle(p.name, p.active)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer border-none ${
                      p.active ? "bg-zinc-100 text-zinc-500 hover:bg-zinc-200" : "bg-zinc-900 text-white hover:bg-zinc-800"
                    }`}
                  >{p.active ? "停用" : "启用"}</button>
                  <button
                    onClick={() => handleUninstall(p.name)}
                    className="px-3 py-1.5 rounded-md text-xs font-medium text-red-500 hover:bg-red-50 transition-colors cursor-pointer bg-transparent border-none"
                  >卸载</button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <PluginMarket onInstalled={fetchPlugins} />
      )}
    </div>
  )
}

function PluginMarket({ onInstalled }: { onInstalled: () => void }) {
  const [items, setItems] = useState<MarketItem[]>([])
  const [installed, setInstalled] = useState<Record<string, boolean>>({})
  const [categories, setCategories] = useState<string[]>([])
  const [activeCat, setActiveCat] = useState("all")
  const [loading, setLoading] = useState(true)
  const [installing, setInstalling] = useState<string | null>(null)

  const fetch = async () => {
    setLoading(true)
    try {
      const data = await apiGet<MarketData>(`/api/v1/adminpanel/plugins/market`)
      setItems(data.items || [])
      setInstalled(data.installed || {})
      setCategories(data.categories || [])
    } catch { toast.error("获取插件市场失败") }
    finally { setLoading(false) }
  }

  useEffect(() => { fetch() }, [activeCat])

  const handleInstall = async (item: MarketItem) => {
    if (installed[item.name]) return toast("已安装")
    setInstalling(item.id)
    try {
      await apiPost("/api/v1/adminpanel/plugins/install-remote", {
        name: item.name, title: item.title, version: item.version,
        description: item.description, author: item.author, hooks: item.hooks,
      })
      toast.success(`"${item.title}" 安装成功`)
      setInstalled((prev) => ({ ...prev, [item.name]: true }))
      onInstalled()
    } catch { toast.error("安装失败") }
    finally { setInstalling(null) }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1.5 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCat(cat)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer border-none ${
              activeCat === cat ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
            }`}
          >{cat === "all" ? "全部" : cat}</button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <svg className="size-6 text-zinc-400 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item) => {
            const isInstalled = installed[item.name]
            return (
              <div key={item.id} className="rounded-xl border border-zinc-200 bg-white p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm text-zinc-900">{item.title}</h3>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-500">{item.category}</span>
                    </div>
                    <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{item.description}</p>
                    <div className="flex items-center gap-2 mt-2 text-[10px] text-zinc-400">
                      <span>{item.author}</span>
                      <span>★ {item.rating}</span>
                      <span>↓ {(item.downloads / 1000).toFixed(1)}k</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      {item.hooks.map((h) => (
                        <span key={h} className="text-[9px] px-1 py-0.5 rounded bg-violet-50 text-violet-600 font-mono">{h}</span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => handleInstall(item)}
                    disabled={isInstalled || installing === item.id}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer border-none shrink-0 ${
                      isInstalled ? "bg-emerald-50 text-emerald-600" : "bg-zinc-900 text-white hover:bg-zinc-800"
                    } disabled:opacity-50`}
                  >
                    {installing === item.id ? "安装中" : isInstalled ? "已安装" : item.price === "免费" ? "免费安装" : item.price}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
