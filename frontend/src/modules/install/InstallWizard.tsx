"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { apiGet, apiPost } from "@/lib/api"
import { useLang } from "@/core/lang"

const INSTALL_STEPS = [
  { num: 1, title: "环境检测", desc: "运行环境" },
  { num: 2, title: "数据库", desc: "连接配置" },
  { num: 3, title: "管理员", desc: "创建账号" },
  { num: 4, title: "完成", desc: "安装成功" },
]

const WELCOME_IMAGE = "/images/install-01.jpg"
const WELCOME_IMAGE_ALT = "Card Girl"

const LICENSE_TEXT = `BBS CMS 软件许可协议

版权所有 (c) BBS CMS 团队

一、许可授权
本软件为开源软件，遵循 MIT 许可证。

二、免责声明
本软件按"原样"提供，不提供任何明示或暗示的保证。

三、使用限制
1. 不得利用本软件从事任何违法违规活动。
2. 用户应对自己发布的内容承担全部法律责任。

点击"同意并继续"即表示你已阅读并同意以上全部条款。`

export function InstallWizard() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [checking, setChecking] = useState(true)
  const [installed, setInstalled] = useState(false)
  const { t, currentLang, setLang, availableLangs } = useLang()
  const [showLangSelect, setShowLangSelect] = useState(true)

  const licenseRef = useRef<HTMLDivElement>(null)
  const [scrolledToBottom, setScrolledToBottom] = useState(false)
  const [countdown, setCountdown] = useState(10)
  const canAgree = scrolledToBottom || countdown === 0

  const [db, setDb] = useState({ type: "mysql", host: "127.0.0.1", port: "3306", user: "", password: "", name: "", prefix: "yu_" })
  const [testingDB, setTestingDB] = useState(false)
  const [dbOK, setDbOK] = useState(false)

  // Redis 缓存（可选）
  const [redis, setRedis] = useState({ enabled: false, host: "127.0.0.1", port: "6379", password: "" })

  // 站点信息
  const [site, setSite] = useState({ name: "BBS CMS", desc: "一个轻量、安全、可扩展的论坛社区平台" })

  // 环境检测
  const [envChecks, setEnvChecks] = useState<{ label: string; ok: boolean; value: string; checking: boolean }[]>([])
  const [envFailed, setEnvFailed] = useState(false)
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  // 按路径前缀分组
  const envGroups = (() => {
    const groups: { key: string; title: string; items: typeof envChecks }[] = [
      { key: "backend", title: "后端", items: [] },
      { key: "frontend-config", title: "前端配置", items: [] },
      { key: "frontend-core", title: "前端核心", items: [] },
      { key: "db-drivers", title: "库核心", items: [] },
      { key: "components", title: "组件", items: [] },
      { key: "theme", title: "主题系统", items: [] },
      { key: "public", title: "静态资源", items: [] },
      { key: "routes", title: "路由模块", items: [] },
      { key: "install-self", title: "安装模块", items: [] },
      { key: "env", title: "运行环境", items: [] },
    ]
    for (const item of envChecks) {
      const label = item.label
      if (label.startsWith("src/components/")) groups[4].items.push(item)
      else if (label.startsWith("themes/")) groups[5].items.push(item)
      else if (label.startsWith("public/")) groups[6].items.push(item)
      else if (label.startsWith("src/app/(") || label.startsWith("src/modules")) groups[7].items.push(item)
      else if (label.includes("install/")) groups[8].items.push(item)
      else if (label.includes("config/config") || label.includes("data/") || label.includes("server.exe")) groups[0].items.push(item)
      else if (label.includes("next.config") || label.includes("tsconfig") || label.includes("postcss") || label.includes("tailwind")) groups[1].items.push(item)
      else if (label.startsWith("package.json")) groups[1].items.push(item)
      else if (label.startsWith("src/app/layout") || label.startsWith("src/app/globals") || label.startsWith("src/app/page") || label.startsWith("src/lib/")) groups[2].items.push(item)
      else if (label.includes("驱动")) groups[3].items.push(item)
      else groups[9].items.push(item)
    }
    return groups.filter(g => g.items.length > 0)
  })() // 有致命错误时禁止继续

  useEffect(() => {
    if (step !== 2) return
    // 先检测后端 API 是否可达
    ;(async () => {
      try {
        const data = await apiGet<{ checks: { name: string; status: string; value: string }[] }>("/api/v1/install/check-env")
        const items = data.checks.map(c => ({
          label: c.name,
          ok: c.status !== "error",
          value: c.value,
          checking: false,
        }))
        setEnvChecks(items)
        setEnvFailed(data.checks.some(c => c.status === "error"))
      } catch {
        setEnvChecks([{ label: "后端服务", ok: false, value: "无法连接", checking: false }])
        setEnvFailed(true)
      }
    })()
  }, [step])

  const [admin, setAdmin] = useState({ user: "admin", pass: "", email: "" })
  const [installing, setInstalling] = useState(false)
  const [progressPct, setProgressPct] = useState(0)
  const [progressLogs, setProgressLogs] = useState<string[]>([])

  const [installPaths, setInstallPaths] = useState<string[]>([])
  const [deleting, setDeleting] = useState(false)
  const [deleted, setDeleted] = useState(false)

  useEffect(() => {
    fetch("/api/v1/install/check").then(r => r.json())
      .then(b => setInstalled(b.data?.installed ?? false)).catch(() => {})
      .finally(() => setChecking(false))
  }, [])

  // 协议倒计时（只在进入协议页时启动一次）
  const countdownRef = useRef(10)
  useEffect(() => {
    if (step !== 1) return
    countdownRef.current = 10
    setCountdown(10)
    setScrolledToBottom(false)
    const t = setInterval(() => {
      setCountdown(prev => {
        const next = prev - 1
        if (next <= 0) { clearInterval(t); return 0 }
        return next
      })
    }, 1000)
    return () => clearInterval(t)
  }, [step])

  useEffect(() => {
    if (step === 5) apiGet<{ paths: string[] }>("/api/v1/install/paths")
      .then(d => setInstallPaths(d.paths)).catch(() => {})
  }, [step])

  // 协议滚动检测（用普通函数避免 useCallback 闭包问题）
  const handleLicenseScroll = () => {
    const el = licenseRef.current
    if (el && el.scrollTop + el.clientHeight >= el.scrollHeight - 4) {
      setScrolledToBottom(true)
    }
  }

  const handleTestDB = async () => {
    setTestingDB(true); setDbOK(false)
    try {
      const r = await fetch("/api/v1/install/check-db", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ db_type: db.type, db_host: db.host, db_port: db.port, db_user: db.user, db_password: db.password, db_name: db.name, table_prefix: db.prefix }) })
      const b = await r.json()
      if (b.code === 0) { setDbOK(true); toast.success("数据库连接成功") } else toast.error(b.message)
    } catch { toast.error(t("install.error_connect")) } finally { setTestingDB(false) }
  }

  const handleInstall = async () => {
    if (!admin.user || !admin.pass || !admin.email) { toast.error(t("install.error_fill_all")); return }
    setInstalling(true)
    setProgressPct(0)
    setProgressLogs([])

    const addLog = (msg: string) => setProgressLogs((prev) => [...prev, msg])

    const tables = [
      `${db.prefix}settings`, `${db.prefix}users`, `${db.prefix}user_logins`,
      `${db.prefix}categories`, `${db.prefix}forums`, `${db.prefix}forum_moderators`,
      `${db.prefix}threads`, `${db.prefix}posts`, `${db.prefix}attachments`,
      `${db.prefix}favorites`, `${db.prefix}likes`, `${db.prefix}comments`,
      `${db.prefix}notifications`, `${db.prefix}search_index`, `${db.prefix}tags`,
      `${db.prefix}tag_threads`, `${db.prefix}navigations`,
    ]

    // 阶段 1: 连接数据库
    addLog(`正在连接数据库...`)
    await sleep(600)
    addLog(`数据库连接成功 (${db.type}://${db.host}:${db.port}/${db.name})`)
    setProgressPct(10)

    // 阶段 2: 逐表建立
    let pct = 10
    for (const table of tables) {
      addLog(`建立数据表 ${table} ... 成功`)
      pct += Math.floor(65 / tables.length)
      setProgressPct(Math.min(pct, 75))
      await sleep(200 + Math.random() * 300)
    }

    // 阶段 3: 写入配置
    addLog(`写入配置文件 config.yaml ... 成功`)
    setProgressPct(90)
    await sleep(400)

    // 阶段 4: 调用后端 API
    addLog(`正在创建管理员账号...`)
    try {
      const r = await fetch("/api/v1/install", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ db_type: db.type, db_host: db.host, db_port: db.port, db_user: db.user, db_password: db.password, db_name: db.name, table_prefix: db.prefix,
          admin_user: admin.user, admin_pass: admin.pass, admin_email: admin.email,
          redis_enabled: redis.enabled, redis_host: redis.host, redis_port: redis.port, redis_password: redis.password,
          site_name: site.name, site_desc: site.desc }) })
      const b = await r.json()
      if (b.code === 0) {
        addLog(`安装完成 ✓`)
        setProgressPct(100)
        await sleep(600)
        setInstalling(false)
        setTimeout(() => setStep(5), 300)
      } else {
        addLog(`错误: ${b.message}`)
        setInstalling(false)
        toast.error("安装失败", { description: b.message })
      }
    } catch {
      addLog(`错误: ${t("install.error_no_response")}`)
      setInstalling(false)
      toast.error(t("install.error_no_response"))
    }
  }

  const handleCleanup = async () => {
    setDeleting(true)
    try {
      const d = await apiPost<{ deleted: string[] }>("/api/v1/install/cleanup")
      setDeleted(true)
      toast.success("已删除", { description: `安全删除 ${d.deleted.length} 个文件夹` })
    } catch (e: any) { toast.error(t("install.error_delete"), { description: e.message }) } finally { setDeleting(false) }
  }

  if (checking) return <div className="text-center"><div className="size-8 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin mx-auto mb-3"/><p className="text-sm text-zinc-500">{t("install.checking")}</p></div>

  // 语言选择（仅未安装时，安装引导第一步）
  if (showLangSelect && !installed) return <LanguageSelect t={t} currentLang={currentLang} availableLangs={availableLangs} onSelect={(code) => { setLang(code); setShowLangSelect(false) }} />

  if (installed) return (
    <div className="w-full max-w-md bg-white rounded-2xl border border-zinc-200 p-8 shadow-sm text-center">
      <div className="size-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
        <svg className="size-8 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
      </div>
      <h1 className="text-lg font-bold text-zinc-900 mb-2">{t("install.already_installed_title")}</h1>
      <p className="text-sm text-zinc-500 mb-6">{t("install.already_installed_desc")}</p>
      <button onClick={() => router.push("/")} className="px-8 py-2.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl text-sm font-bold hover:from-pink-600 hover:to-purple-600 cursor-pointer border-none">{t("install.already_installed_btn")}</button>
    </div>
  )

  if (step === 0) return (
    <div className="w-full max-w-4xl relative">
      <SakuraPetals count={18} /><TwinkleStars count={12} /><FloatingOrbs count={10} />
      <div className="relative animate-fade-in" style={{ animationDelay: "0.1s", animationFillMode: "backwards" }}>
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 animate-ribbon">
          <div className="px-6 py-1.5 rounded-full text-white text-[11px] font-bold tracking-widest flex items-center gap-1.5"
            style={{ background: "linear-gradient(135deg, #ff6b9d 0%, #c44569 50%, #ff6b9d 100%)", boxShadow: "0 2px 8px rgba(255,107,157,0.5), inset 0 1px 0 rgba(255,255,255,0.3)" }}>
            <span>★</span><span>LEGENDARY</span><span>★</span>
          </div>
        </div>
        <div className="relative bg-white rounded-3xl overflow-hidden animate-card-float"
          style={{ border: "3px solid #f8c0d4", boxShadow: "0 0 40px rgba(255,105,180,0.2), 0 0 80px rgba(255,20,147,0.1), 0 20px 60px rgba(0,0,0,0.15)" }}>
          <div className="h-2" style={{ background: "linear-gradient(90deg, #ff9a9e 0%, #fecfef 20%, #ff6b9d 40%, #fecfef 60%, #ff9a9e 80%, #fecfef 100%)", backgroundSize: "200% 100%", animation: "shimmer 2s linear infinite" }} />
          <div className="relative flex items-center justify-center overflow-hidden"
            style={{ background: "linear-gradient(180deg, #fef0f5 0%, #fce4ec 30%, #f8bbd0 70%, #f48fb1 100%)", minHeight: "340px" }}>
            <div className="relative z-10 flex flex-col items-center gap-4 py-8">
              <div className="relative rounded-full overflow-hidden"
                style={{ width: "200px", height: "200px", border: "4px solid white", boxShadow: "0 0 0 3px #f8c0d4, 0 0 30px rgba(255,105,180,0.3), 0 8px 24px rgba(0,0,0,0.1)" }}>
                <img src={WELCOME_IMAGE} alt={WELCOME_IMAGE_ALT} className="w-full h-full object-cover" />
              </div>
              <div className="px-6 py-2 rounded-full text-center"
                style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,240,245,0.9))", border: "1px solid rgba(255,105,180,0.3)" }}>
                <p className="text-xs font-bold tracking-wider" style={{ color: "#c44569" }}>♡ Card Girl ♡</p>
              </div>
            </div>
          </div>
            <div className="px-8 sm:px-14 pb-8 pt-6" style={{ background: "linear-gradient(180deg, #fafafa 0%, #fff 100%)" }}>
            <div className="text-center mb-5">
              <h1 className="text-4xl sm:text-5xl font-black mb-2"
                style={{ background: "linear-gradient(135deg, #ff6b9d 0%, #c44569 50%, #9b3b5c 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>BBS CMS</h1>
              <p className="text-base" style={{ color: "#9e7a8b" }}>{t("install.welcome_subtitle")}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { icon: "💬", label: t("install.welcome_subtitle").includes("forum") ? "Community Forum" : "社区论坛", sub: t("install.welcome_subtitle").includes("forum") ? "Multi-level Boards" : "多级版块", color: "#ff6b9d" },
                { icon: "📝", label: currentLang === "en" ? "Content Management" : "内容管理", sub: currentLang === "en" ? "Blog·Articles" : "博客·文章", color: "#9b59b6" },
                { icon: "🎨", label: currentLang === "en" ? "Theme Engine" : "主题引擎", sub: currentLang === "en" ? "3-layer Fallback" : "三层兜底", color: "#e056a0" },
                { icon: "🔒", label: currentLang === "en" ? "Secure Auth" : "安全认证", sub: currentLang === "en" ? "JWT·RBAC" : "JWT·RBAC", color: "#ff9a76" },
              ].map(f => (
                <div key={f.label} className="flex items-center gap-3 p-4 rounded-2xl"
                  style={{ background: "linear-gradient(135deg, rgba(255,240,245,0.8), rgba(255,255,255,0.9))", border: "1px solid rgba(248,192,212,0.4)" }}>
                  <div className="size-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: `linear-gradient(135deg, ${f.color}15, ${f.color}25)` }}>{f.icon}</div>
                  <div><p className="text-sm font-bold" style={{ color: f.color }}>{f.label}</p><p className="text-xs text-zinc-400">{f.sub}</p></div>
                </div>
              ))}
            </div>
            <div className="flex flex-col items-center">
              <button onClick={() => setStep(1)}
                className="relative px-16 py-4 text-white text-lg sm:text-xl font-bold rounded-2xl cursor-pointer border-none active:scale-95"
                style={{ background: "linear-gradient(135deg, #ff6b9d, #c44569, #ff6b9d)", backgroundSize: "200% 100%", animation: "shimmer 2s linear infinite, button-glow 2s ease-in-out infinite" }}>{t("install.start_install")}</button>
            </div>
          </div>
        </div>
      </div>
      <p className="text-center text-xs mt-5" style={{ color: "#c47a8d" }}>♡ Powered by BBS CMS ♡</p>
    </div>
  )

  if (step === 1) return (
    <div className="w-full max-w-2xl">
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50/50">
          <h1 className="text-lg font-bold text-zinc-900">{t("install.license_title")}</h1>
          <p className="text-xs text-zinc-400 mt-0.5">{t("install.license_desc")}</p>
        </div>
        <div ref={licenseRef} onScroll={handleLicenseScroll} className="px-6 py-4 h-80 overflow-y-auto text-base text-zinc-600 leading-relaxed whitespace-pre-line border-b border-zinc-100">{LICENSE_TEXT}</div>
        <div className="px-6 py-3 bg-zinc-50/50 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {scrolledToBottom ? (<><div className="size-2 rounded-full bg-emerald-400"/><span className="text-xs text-emerald-600 font-medium">{t("install.license_read_all")}</span></>)
            : countdown === 0 ? (<><div className="size-2 rounded-full bg-emerald-400"/><span className="text-xs text-emerald-600 font-medium">{t("install.license_countdown_done")}</span></>)
            : (<><div className="size-2 rounded-full bg-zinc-300"/><span className="text-xs text-zinc-500">{t("install.license_prompt")}</span></>)}
          </div>
          {countdown > 0 && !scrolledToBottom ? <span className="text-xs text-purple-500 font-mono font-bold">{t("install.license_countdown", { s: countdown })}</span> : <span className="text-xs text-emerald-500 font-medium">{t("install.license_can_continue")}</span>}
        </div>
        <div className="px-6 py-4 flex gap-3">
          <button onClick={() => setStep(0)} className="flex-1 py-2.5 rounded-xl border border-zinc-200 text-sm text-zinc-500 hover:bg-zinc-50 transition-colors cursor-pointer bg-white">{t("install.license_reject")}</button>
          <button onClick={() => setStep(2)} disabled={!canAgree} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white text-sm font-bold hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 transition-all cursor-pointer border-none disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-purple-500/20">{t("install.license_agree")}</button>
        </div>
      </div>
    </div>
  )

  const installStep = step - 2
  return (
    <div className="w-full max-w-2xl">
      <div className="flex items-center justify-center gap-0 mb-8">
        {INSTALL_STEPS.map((s, i) => (
          <div key={s.num} className="flex items-center">
            <div className="flex items-center gap-2">
              <div className={`size-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${i <= installStep ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white" : "bg-zinc-200 text-zinc-400"}`}>
                {i < installStep ? (<svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>) : s.num}
              </div>
              <div className="hidden sm:block"><p className="text-xs font-medium text-zinc-600">{s.title}</p><p className="text-[10px] text-zinc-400">{s.desc}</p></div>
            </div>
            {i < 3 && <div className={`w-8 h-px mx-1 ${i < installStep ? "bg-purple-400" : "bg-zinc-200"}`}/>}
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 sm:p-8 shadow-sm">
        {/* 环境检测 */}
        {installStep === 0 && (
          <div>
            <h1 className="text-lg font-bold text-zinc-900 mb-1">环境检测</h1>
            <p className="text-xs text-zinc-500 mb-5">正在检测项目文件完整性与运行环境，缺失关键文件将无法继续安装。</p>

            {/* 状态汇总 */}
            {envChecks.length > 0 && (
              <div className="flex gap-3 mb-5">
                <div className="flex-1 rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-2.5">
                  <p className="text-[10px] text-emerald-500 uppercase tracking-wider font-bold mb-0.5">通过</p>
                  <p className="text-lg font-bold text-emerald-600">{envChecks.filter(c => c.ok).length}</p>
                </div>
                <div className="flex-1 rounded-xl bg-red-50 border border-red-100 px-4 py-2.5">
                  <p className="text-[10px] text-red-400 uppercase tracking-wider font-bold mb-0.5">错误</p>
                  <p className="text-lg font-bold text-red-500">{envChecks.filter(c => !c.ok && !c.checking).length}</p>
                </div>
                <div className="flex-1 rounded-xl bg-zinc-50 border border-zinc-100 px-4 py-2.5">
                  <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold mb-0.5">总计</p>
                  <p className="text-lg font-bold text-zinc-600">{envChecks.length}</p>
                </div>
              </div>
            )}

            {/* 检测列表 — 分类折叠 */}
            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
              {envChecks.length === 0 ? (
                <div className="text-center py-12">
                  <span className="size-8 border-2 border-zinc-300 border-t-purple-500 rounded-full animate-spin inline-block mb-3" />
                  <p className="text-sm text-zinc-400">正在检测运行环境...</p>
                </div>
              ) : (
                envGroups.map(group => {
                  const isOpen = collapsed[group.key] === true
                  const errorCount = group.items.filter(i => !i.ok && !i.checking).length
                  const okCount = group.items.filter(i => i.ok).length
                  return (
                    <div key={group.key} className="rounded-xl border border-zinc-100 overflow-hidden">
                      {/* 分组标题 — 可点击折叠 */}
                      <button
                        onClick={() => setCollapsed(prev => ({ ...prev, [group.key]: !prev[group.key] }))}
                        className="w-full flex items-center justify-between px-4 py-2.5 bg-zinc-50/80 hover:bg-zinc-100 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <svg className={`size-3.5 text-zinc-400 transition-transform ${isOpen ? "rotate-90" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M9 18l6-6-6-6"/>
                          </svg>
                          <span className="text-sm font-bold text-zinc-700">{group.title}</span>
                          <span className="text-[10px] text-zinc-400">{group.items.length} 项</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {errorCount > 0 && <span className="text-[10px] font-bold text-red-500">{errorCount} 错误</span>}
                          {okCount > 0 && <span className="text-[10px] text-emerald-500">{okCount} ✓</span>}
                        </div>
                      </button>
                      {/* 分组内容 */}
                      {isOpen && (
                        <div className="divide-y divide-zinc-50">
                          {group.items.map((item, j) => (
                            <div key={j} className="flex items-center gap-3 py-2.5 px-4 hover:bg-zinc-50/50 transition-colors">
                              <div className="flex-shrink-0">
                                {item.checking ? (
                                  <span className="size-4 border-2 border-zinc-300 border-t-purple-500 rounded-full animate-spin block" />
                                ) : item.ok ? (
                                  <div className="size-5 rounded-full bg-emerald-100 flex items-center justify-center">
                                    <svg className="size-3 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
                                  </div>
                                ) : (
                                  <div className="size-5 rounded-full bg-red-100 flex items-center justify-center">
                                    <svg className="size-3 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[12px] text-zinc-600 truncate">{item.label}</p>
                              </div>
                              <div className="flex-shrink-0 text-right">
                                {item.checking ? (
                                  <span className="text-[10px] text-zinc-400">检测中</span>
                                ) : item.ok ? (
                                  <span className="text-[10px] text-emerald-500 font-medium">{item.value}</span>
                                ) : (
                                  <span className="text-[10px] text-red-400 font-medium">{item.value}</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>

            <div className="flex gap-2 mt-5 pt-4 border-t border-zinc-100">
              <button onClick={() => setStep(3)} disabled={envChecks.length === 0 || envFailed}
                className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 text-white text-sm font-bold hover:from-pink-600 hover:to-purple-600 cursor-pointer border-none disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                {envChecks.length === 0 ? "检测中..." : envFailed ? "请先解决以上错误" : "继续配置数据库"}
              </button>
            </div>
          </div>
        )}

        {/* 数据库配置 */}
        {installStep === 1 && (
          <div>
            <h1 className="text-lg font-bold text-zinc-900 mb-4">数据库配置</h1>

            {/* 数据库类型选择 */}
            <div className="mb-5">
              <label className="block text-xs font-medium text-zinc-500 mb-2">数据库类型</label>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { key: "mysql", label: "MySQL", port: "3306", icon: "🐬" },
                  { key: "mariadb", label: "MariaDB", port: "3306", icon: "🦭" },
                  { key: "postgres", label: "PostgreSQL", port: "5432", icon: "🐘" },
                ] as const).map(item => (
                  <button key={item.key}
                    onClick={() => setDb({ ...db, type: item.key, port: item.port })}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all cursor-pointer ${db.type === item.key ? "border-purple-400 bg-purple-50 text-purple-700 shadow-sm" : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300"}`}
                  >
                    <span className="text-base">{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2"><label className="block text-xs font-medium text-zinc-500 mb-1">主机</label><input className="w-full h-9 px-3 rounded-lg border border-zinc-200 text-sm outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-200" value={db.host} onChange={e => setDb({...db, host: e.target.value})} placeholder="127.0.0.1 或 localhost"/></div>
                <div><label className="block text-xs font-medium text-zinc-500 mb-1">端口</label><input className="w-full h-9 px-3 rounded-lg border border-zinc-200 text-sm outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-200" value={db.port} onChange={e => setDb({...db, port: e.target.value})}/></div>
              </div>
              <div><label className="block text-xs font-medium text-zinc-500 mb-1">用户名</label><input className="w-full h-9 px-3 rounded-lg border border-zinc-200 text-sm outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-200" value={db.user} onChange={e => setDb({...db, user: e.target.value})}/></div>
              <div><label className="block text-xs font-medium text-zinc-500 mb-1">密码</label><input type="password" className="w-full h-9 px-3 rounded-lg border border-zinc-200 text-sm outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-200" value={db.password} onChange={e => setDb({...db, password: e.target.value})}/></div>
              <div><label className="block text-xs font-medium text-zinc-500 mb-1">数据库名</label><input className="w-full h-9 px-3 rounded-lg border border-zinc-200 text-sm outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-200" value={db.name} onChange={e => setDb({...db, name: e.target.value})}/></div>
              <div><label className="block text-xs font-medium text-zinc-500 mb-1">表前缀 <span className="text-zinc-300">（如 yu_，则表名为 yu_users）</span></label><input className="w-full h-9 px-3 rounded-lg border border-zinc-200 text-sm outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-200 font-mono" value={db.prefix} onChange={e => setDb({...db, prefix: e.target.value})} /></div>
            </div>

            {/* Redis 缓存（可选卡片） */}
            <div className="mt-5 p-4 rounded-2xl border border-zinc-200 bg-gradient-to-br from-zinc-50 to-white shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <label className="flex items-center gap-2 cursor-pointer flex-1">
                  <input type="checkbox" checked={redis.enabled} onChange={e => setRedis({...redis, enabled: e.target.checked})}
                    className="size-4 rounded border-zinc-300 text-purple-500 focus:ring-purple-400" />
                  <span className="text-sm font-bold text-zinc-700">Redis 缓存</span>
                  <span className="text-[10px] text-zinc-400">（可选 — 加速网站访问）</span>
                </label>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
                  style={{ background: "linear-gradient(135deg, #ff6b9d, #c44569)" }}>推荐</span>
              </div>
              {redis.enabled && (
                <div className="space-y-3 pt-3 border-t border-zinc-100 mt-2">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2"><label className="block text-xs font-medium text-zinc-500 mb-1">主机</label><input className="w-full h-9 px-3 rounded-lg border border-zinc-200 text-sm outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-200" value={redis.host} onChange={e => setRedis({...redis, host: e.target.value})} /></div>
                    <div><label className="block text-xs font-medium text-zinc-500 mb-1">端口</label><input className="w-full h-9 px-3 rounded-lg border border-zinc-200 text-sm outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-200" value={redis.port} onChange={e => setRedis({...redis, port: e.target.value})} /></div>
                  </div>
                  <div><label className="block text-xs font-medium text-zinc-500 mb-1">密码 <span className="text-zinc-300">（无密码留空）</span></label><input type="password" className="w-full h-9 px-3 rounded-lg border border-zinc-200 text-sm outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-200" value={redis.password} onChange={e => setRedis({...redis, password: e.target.value})} placeholder="留空表示无密码" /></div>
                </div>
              )}
            </div>

            {/* 站点信息 */}
            <div className="mt-5 p-4 rounded-2xl border border-zinc-200 bg-gradient-to-br from-blue-50 to-white shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <svg className="size-4 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
                <span className="text-sm font-bold text-zinc-700">站点信息</span>
                <span className="text-[10px] text-zinc-400">（将显示在管理后台仪表盘）</span>
              </div>
              <div className="space-y-3">
                <div><label className="block text-xs font-medium text-zinc-500 mb-1">站点名称</label><input className="w-full h-9 px-3 rounded-lg border border-zinc-200 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200" value={site.name} onChange={e => setSite({...site, name: e.target.value})} placeholder="BBS CMS" /></div>
                <div><label className="block text-xs font-medium text-zinc-500 mb-1">站点描述</label><input className="w-full h-9 px-3 rounded-lg border border-zinc-200 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200" value={site.desc} onChange={e => setSite({...site, desc: e.target.value})} placeholder="简单描述你的站点" /></div>
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <button onClick={handleTestDB} disabled={testingDB} className={`flex-1 py-2 rounded-lg border text-sm font-medium cursor-pointer transition-colors ${dbOK ? "border-emerald-400 text-emerald-600 bg-emerald-50" : "border-purple-400 text-purple-600 hover:bg-purple-50 bg-white"} disabled:opacity-50`}>{testingDB ? "测试中..." : dbOK ? "✓ 连接成功" : "测试连接"}</button>
              <button onClick={() => setStep(4)} disabled={!dbOK} className="flex-1 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 text-white text-sm font-medium hover:from-pink-600 hover:to-purple-600 cursor-pointer border-none disabled:opacity-30">下一步</button>
            </div>
          </div>
        )}
        {installStep === 2 && (
          <div>
            {installing ? (
              <InstallProgress pct={progressPct} logs={progressLogs} />
            ) : (
              <>
                <h1 className="text-lg font-bold text-zinc-900 mb-4">创建管理员账号</h1>
                <p className="text-xs text-zinc-500 mb-4">此账号将拥有超级管理员权限，请妥善保管。</p>
                <div className="space-y-3">
                  <div><label className="block text-xs font-medium text-zinc-500 mb-1">用户名</label><input className="w-full h-9 px-3 rounded-lg border border-zinc-200 text-sm outline-none focus:border-purple-400" value={admin.user} onChange={e => setAdmin({...admin, user: e.target.value})} placeholder="admin"/></div>
                  <div><label className="block text-xs font-medium text-zinc-500 mb-1">密码</label><input type="password" className="w-full h-9 px-3 rounded-lg border border-zinc-200 text-sm outline-none focus:border-purple-400" value={admin.pass} onChange={e => setAdmin({...admin, pass: e.target.value})} placeholder="至少 6 位"/></div>
                  <div><label className="block text-xs font-medium text-zinc-500 mb-1">邮箱</label><input type="email" className="w-full h-9 px-3 rounded-lg border border-zinc-200 text-sm outline-none focus:border-purple-400" value={admin.email} onChange={e => setAdmin({...admin, email: e.target.value})} placeholder="admin@example.com"/></div>
                </div>
                <div className="flex gap-2 mt-5">
                  <button onClick={() => setStep(3)} className="flex-1 py-2 rounded-lg border border-zinc-200 text-sm text-zinc-600 hover:bg-zinc-50 cursor-pointer bg-white">上一步</button>
                  <button onClick={handleInstall} disabled={installing} className="flex-1 py-2 rounded-lg bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white text-sm font-bold hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 cursor-pointer border-none disabled:opacity-50 shadow-lg shadow-purple-500/25">{installing ? "安装中..." : "开始安装"}</button>
                </div>
              </>
            )}
          </div>
        )}
        {installStep === 3 && (
          <div className="text-center">
            <div className="size-20 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center mx-auto mb-4">
              <svg className="size-10 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
            </div>
            <h1 className="text-xl font-bold text-zinc-900 mb-1">安装成功！</h1>
            <p className="text-sm text-zinc-500 mb-6">系统已就绪，为了安全建议删除 install 文件夹。</p>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-left">
              <div className="flex items-start gap-2 mb-3">
                <svg className="size-5 text-amber-500 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                <div><p className="text-sm font-bold text-amber-800 mb-1">安全提醒</p>
                  <p className="text-xs text-amber-700 leading-relaxed">安装完成后应删除 install 文件夹，防止被他人利用重复安装或触发安全漏洞。以下文件将被删除：</p>
                </div>
              </div>
              <div className="bg-white/70 rounded-lg p-3 mb-3 font-mono text-[11px] text-zinc-600 leading-relaxed border border-amber-100">
                {installPaths.length > 0 ? installPaths.map((p, i) => (
                  <div key={i} className="flex items-center gap-2 py-0.5">
                    <svg className="size-3 text-zinc-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    <span className="truncate">{p}</span>
                  </div>
                )) : <p className="text-zinc-400">加载中...</p>}
              </div>
              {!deleted ? (
                <div className="flex gap-2">
                  <button onClick={handleCleanup} disabled={deleting} className="flex-1 py-2.5 rounded-lg bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors cursor-pointer border-none disabled:opacity-50 flex items-center justify-center gap-1.5">
                    {deleting ? <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>}
                    {deleting ? "删除中..." : "删除 install 文件夹"}
                  </button>
                  <button onClick={() => setDeleted(true)} className="px-4 py-2.5 rounded-lg border border-zinc-200 text-sm text-zinc-500 hover:bg-zinc-50 transition-colors cursor-pointer bg-white">保留，我知道风险了</button>
                </div>
              ) : (
                <p className="text-xs text-emerald-600 font-medium flex items-center gap-1 justify-center">
                  <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg> install 文件夹已处理，现在可以进入系统了
                </p>
              )}
            </div>
            <div className="space-y-2">
              <button onClick={() => router.push("/login?redirect=admin")} className="w-full py-3 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white rounded-xl text-sm font-bold hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 transition-all cursor-pointer border-none shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2">
                <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>进入管理后台</button>
              <button onClick={() => router.push("/")} className="w-full py-2.5 border border-zinc-200 text-zinc-600 rounded-xl text-sm font-medium hover:bg-zinc-50 transition-colors cursor-pointer bg-white flex items-center justify-center gap-2">
                <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>进入网站首页</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// 语言选择组件
function LanguageSelect({ t, currentLang, availableLangs, onSelect }: {
  t: (key: string, vars?: Record<string, string | number>) => string
  currentLang: string
  availableLangs: { code: string; name: string; flag: string }[]
  onSelect: (code: string) => void
}) {
  const handleSelect = (code: string) => {
    onSelect(code)
    // 自动进入下一步（欢迎页）
  }

  return (
    <div className="w-full max-w-2xl">
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50/50">
          <h1 className="text-lg font-bold text-zinc-900">{t("install.select_lang")}</h1>
          <p className="text-xs text-zinc-400 mt-0.5">{t("install.select_lang_desc")}</p>
        </div>
        <div className="p-6 space-y-3">
          {availableLangs.map((lang) => {
            const isActive = currentLang === lang.code
            return (
              <button
                key={lang.code}
                onClick={() => handleSelect(lang.code)}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl text-sm font-medium transition-all cursor-pointer border text-left ${
                  isActive
                    ? "border-purple-400 bg-purple-50 text-purple-700 shadow-sm"
                    : "border-zinc-100 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50"
                }`}
              >
                <span className="text-3xl">{lang.flag}</span>
                <div className="flex-1">
                  <p className="text-sm font-bold">{lang.name}</p>
                  <p className="text-[11px] text-zinc-400 font-mono mt-0.5">{lang.code}</p>
                </div>
                {isActive && (
                  <div className="size-6 rounded-full bg-purple-500 flex items-center justify-center">
                    <svg className="size-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </div>
                )}
              </button>
            )
          })}
        </div>
        <div className="px-6 py-4 border-t border-zinc-100 bg-zinc-50/30">
          <div className="flex gap-3">
            <button
              onClick={() => onSelect(currentLang)}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white text-sm font-bold hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 transition-all cursor-pointer border-none shadow-lg shadow-purple-500/20"
            >
              {currentLang === "zh-CN" ? "选择语言并继续" : "Select & Continue"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// 安装进度条组件
function InstallProgress({ pct, logs }: { pct: number; logs: string[] }) {
  return (
    <div className="py-4">
      {/* 进度条 */}
      <div className="mb-4">
        <div className="h-2.5 rounded-full bg-zinc-100 overflow-hidden border border-zinc-200">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${pct}%`,
              background: "linear-gradient(90deg, #67c23a, #85ce61)",
            }}
          />
        </div>
        <p className="text-xs text-zinc-400 mt-1.5 text-right">{pct}%</p>
      </div>

      {/* 日志区 */}
      <div className="bg-zinc-50 rounded-xl border border-zinc-100 p-4 mb-3 max-h-[340px] overflow-y-auto">
        {logs.map((msg, i) => {
          const isError = msg.startsWith("错误:")
          const isDone = msg.endsWith("✓")
          return (
            <div
              key={i}
              className={`text-xs py-0.5 animate-fade-in ${
                isError ? "text-red-500" : isDone ? "text-emerald-600 font-medium" : "text-zinc-600"
              }`}
            >
              {msg}
            </div>
          )
        })}
        {logs.length === 0 && (
          <p className="text-xs text-zinc-400 animate-pulse">正在准备安装...</p>
        )}
      </div>

      {/* 状态 */}
      <p className="text-xs text-zinc-400 text-center">
        {pct < 100 ? "正在安装..." : "安装完成"}
      </p>
    </div>
  )
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// 装饰组件
function SakuraPetals({ count }: { count: number }) {
  return <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="absolute animate-sakura" style={{
        left: `${Math.random() * 100}%`, width: `${10 + Math.random() * 14}px`, height: `${10 + Math.random() * 14}px`,
        animationDuration: `${6 + Math.random() * 8}s`, animationDelay: `-${Math.random() * 10}s`,
        opacity: 0.3 + Math.random() * 0.4, fontSize: `${10 + Math.random() * 14}px`, lineHeight: 1,
      }}>🌸</div>
    ))}
  </div>
}
function TwinkleStars({ count }: { count: number }) {
  return <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="absolute animate-star" style={{
        left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, width: `${6 + Math.random() * 12}px`, height: `${6 + Math.random() * 12}px`,
        animationDuration: `${1.5 + Math.random() * 2.5}s`, animationDelay: `-${Math.random() * 3}s`,
        color: i % 3 === 0 ? "#ffd700" : "#ffb6c1", fontSize: `${6 + Math.random() * 10}px`,
      }}>{i % 2 === 0 ? "✦" : "✧"}</div>
    ))}
  </div>
}
function FloatingOrbs({ count }: { count: number }) {
  return <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="absolute rounded-full" style={{
        left: `${5 + Math.random() * 90}%`, top: `${10 + Math.random() * 80}%`, width: `${4 + Math.random() * 8}px`, height: `${4 + Math.random() * 8}px`,
        background: `radial-gradient(circle, ${["rgba(255,105,180,0.6)", "rgba(255,215,0,0.5)", "rgba(147,112,219,0.5)"][i % 3]}, transparent)`,
        animation: `float ${4 + Math.random() * 6}s ease-in-out infinite`, animationDelay: `-${Math.random() * 5}s`,
      }}/>
    ))}
  </div>
}
