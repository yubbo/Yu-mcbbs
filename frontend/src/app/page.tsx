// app/page.tsx — BBS CMS 首页
// Header / Footer 由 LayoutShell 统一提供

import Link from "next/link"
import { cookies } from "next/headers"

async function isLoggedIn() {
  const cookieStore = await cookies()
  return !!cookieStore.get("token")?.value
}

export default async function HomePage() {
  const loggedIn = await isLoggedIn()

  return (
    <div className="flex flex-col">
      {/* Hero — 毛玻璃卡片，适配任意背景图 */}
      <section className="relative py-28 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white/85 backdrop-blur-xl rounded-2xl px-10 py-12 border border-white/40 shadow-lg">
            <h1 className="text-4xl font-extrabold text-zinc-900 leading-tight tracking-tight">
              构建你的社区
            </h1>
            <p className="mt-5 text-base text-zinc-600 leading-relaxed max-w-md mx-auto">
              一个集论坛与内容管理于一体的轻量平台，快速搭建属于你的 BBS 社区与博客站点。
            </p>
            <div className="mt-8 flex items-center justify-center gap-3">
              <Link
                href={loggedIn ? "/forum" : "/register"}
                className="inline-flex items-center px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium no-underline hover:bg-blue-700 transition-colors shadow-sm"
              >
                {loggedIn ? "进入论坛" : "立即注册"}
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center px-6 py-2.5 border border-zinc-200 bg-white text-zinc-700 rounded-lg text-sm font-medium no-underline hover:bg-zinc-50 transition-colors"
              >
                了解更多
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 功能特性 — 白色实底隔离背景 */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-zinc-900">平台特性</h2>
            <p className="mt-2 text-sm text-zinc-500">简洁、高效、可扩展</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard
              title="论坛 BBS"
              desc="多级版块、帖子发布、回复互动，满足各类社区需求。"
            />
            <FeatureCard
              title="博客 CMS"
              desc="文章管理、分类归档、标签系统，轻松运营内容站点。"
            />
            <FeatureCard
              title="主题引擎"
              desc="三层模板兜底机制，自定义主题开发灵活无侵入。"
            />
          </div>
        </div>
      </section>

      {/* 最新动态 */}
      <section className="py-20 px-6 bg-zinc-50/90 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-zinc-900">最新动态</h2>
            <p className="mt-2 text-sm text-zinc-500">功能持续迭代中</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              { title: "用户管理系统上线", tag: "新增" },
              { title: "全站背景图支持", tag: "新增" },
              { title: "管理后台模块化重构", tag: "优化" },
              { title: "弹窗动画系统接入", tag: "优化" },
            ].map((item, i) => (
              <NewsCard key={i} title={item.title} tag={item.tag} />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

function FeatureCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="group relative p-8 rounded-2xl border border-zinc-100 bg-white shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
      <h3 className="text-lg font-semibold text-zinc-900 mb-3">{title}</h3>
      <p className="text-sm text-zinc-500 leading-relaxed">{desc}</p>
    </div>
  )
}

function NewsCard({ title, tag }: { title: string; tag: string }) {
  const tagColor =
    tag === "新增" ? "bg-blue-100 text-blue-600" : "bg-amber-100 text-amber-600"

  return (
    <div className="flex items-start gap-4 p-5 rounded-xl border border-zinc-100 bg-white/90 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-semibold text-zinc-900 truncate">{title}</h3>
        <p className="text-sm text-zinc-400 mt-1.5 leading-relaxed">
          平台持续迭代中，更多功能即将上线。
        </p>
      </div>
      <span className={`shrink-0 text-[11px] font-medium px-2.5 py-1 rounded-full ${tagColor}`}>
        {tag}
      </span>
    </div>
  )
}
