"use client"

// modules/adminpanel/settings/ui/theme/ThemeMarket.tsx — 应用中心
// 浏览、搜索、一键安装在线主题

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { apiGet, apiPost } from "@/lib/api"

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
}

interface MarketData {
  items: MarketItem[]
  installed: Record<string, boolean>
  categories: string[]
}

export function ThemeMarket({ onInstalled }: { onInstalled: () => void }) {
  const [items, setItems] = useState<MarketItem[]>([])
  const [installed, setInstalled] = useState<Record<string, boolean>>({})
  const [categories, setCategories] = useState<string[]>([])
  const [activeCat, setActiveCat] = useState("all")
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [installing, setInstalling] = useState<string | null>(null)

  const fetchMarket = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set("q", search)
      if (activeCat !== "all") params.set("category", activeCat)
      const qs = params.toString()
      const data = await apiGet<MarketData>(`/api/v1/adminpanel/themes/market${qs ? "?" + qs : ""}`)
      setItems(data.items || [])
      setInstalled(data.installed || {})
      setCategories(data.categories || [])
    } catch {
      toast.error("获取应用中心失败")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchMarket() }, [activeCat])

  const handleInstall = async (item: MarketItem) => {
    if (installed[item.name]) {
      toast("已安装该主题")
      return
    }
    if (item.price !== "免费") {
      toast("付费主题暂不支持在线购买，请联系开发者")
      return
    }
    setInstalling(item.id)
    try {
      await apiPost(`/api/v1/adminpanel/themes/install-remote`, {
        name: item.name,
        title: item.title,
        description: item.description,
        author: item.author,
        version: item.version,
      })
      toast.success(`"${item.title}" 安装成功`)
      setInstalled((prev) => ({ ...prev, [item.name]: true }))
      onInstalled()
    } catch {
      toast.error("安装失败，请检查网络连接")
    } finally {
      setInstalling(null)
    }
  }

  const formatDownloads = (n: number) => {
    if (n >= 1000) return (n / 1000).toFixed(1) + "k"
    return String(n)
  }

  return (
    <div className="space-y-5">
      {/* 搜索栏 */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          <input
            type="text"
            placeholder="搜索主题..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchMarket()}
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-zinc-200 text-sm outline-none focus:border-blue-400"
          />
        </div>
        <button
          onClick={fetchMarket}
          className="h-9 px-4 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors cursor-pointer border-none"
        >
          搜索
        </button>
      </div>

      {/* 分类标签 */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCat(cat)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer border-none ${
              activeCat === cat
                ? "bg-zinc-900 text-white"
                : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
            }`}
          >
            {cat === "all" ? "全部" : cat}
          </button>
        ))}
      </div>

      {/* 主题列表 */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <svg className="size-6 text-zinc-400 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
          <span className="ml-2 text-sm text-zinc-400">加载中...</span>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16">
          <div className="size-16 rounded-2xl bg-zinc-100 flex items-center justify-center mx-auto mb-3">
            <svg className="size-8 text-zinc-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          </div>
          <p className="text-sm text-zinc-500">未找到匹配的主题</p>
          <p className="text-xs text-zinc-400 mt-1">尝试其他关键词或分类</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item) => {
            const isInstalled = installed[item.name]
            const isPaid = item.price !== "免费"

            return (
              <div key={item.id} className="rounded-xl border border-zinc-200 bg-white p-4 flex gap-4 hover:shadow-sm transition-shadow">
                {/* 缩略图占位 */}
                <div className="size-16 rounded-lg bg-gradient-to-br from-zinc-100 to-zinc-200 shrink-0 flex items-center justify-center">
                  <svg className="size-7 text-zinc-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm text-zinc-900 truncate">{item.title}</h3>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-500 shrink-0">{item.category}</span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{item.description}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[10px] text-zinc-400">{item.author}</span>
                    <span className="text-[10px] text-zinc-400 flex items-center gap-0.5">
                      <svg className="size-3 text-amber-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.86L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                      {item.rating}
                    </span>
                    <span className="text-[10px] text-zinc-400">↓ {formatDownloads(item.downloads)}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-xs font-semibold text-zinc-700">{item.version}</span>
                    <button
                      onClick={() => handleInstall(item)}
                      disabled={isInstalled || isPaid || installing === item.id}
                      className={`ml-auto px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer border-none ${
                        isInstalled
                          ? "bg-emerald-50 text-emerald-600"
                          : isPaid
                          ? "bg-amber-50 text-amber-600"
                          : "bg-zinc-900 text-white hover:bg-zinc-800"
                      } disabled:opacity-50`}
                    >
                      {installing === item.id ? "安装中..." : isInstalled ? "已安装" : isPaid ? item.price : "免费安装"}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
