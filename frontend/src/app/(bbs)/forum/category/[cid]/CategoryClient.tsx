"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"

interface SubForum {
  id: number
  name: string
  name_abbr: string
  color: string
  topics: number
  posts: number | string
  today: number
  latest_title: string
  latest_url: string
  comments: number
  likes: number
}

interface CategoryData {
  id: number
  name: string
  forum_count: number
  total_topics: number
  total_posts: number | string
  moderators: { name: string; url: string; initial: string }[]
  forums: SubForum[]
}

const COLORS = ["#534AB7", "#D4537E", "#185FA5", "#3B6D11", "#BA7517", "#E24B4A"]

export function CategoryClient() {
  const params = useParams<{ cid: string }>()
  const cid = parseInt(params.cid || "1")

  const [data, setData] = useState<CategoryData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: 接入真实 API
    // fetch(`/api/v1/forum/categories/${cid}`).then(...)
    // 先用 mock 数据
    const mock: CategoryData = {
      id: cid,
      name: "综合分区",
      forum_count: 6,
      total_topics: 1398,
      total_posts: "1.4万",
      moderators: [
        { name: "ZhanxKer", url: "#", initial: "Z" },
        { name: "风纪委员", url: "#", initial: "风" },
      ],
      forums: [
        { id: 1, name: "新闻资讯", name_abbr: "新", color: COLORS[0], topics: 29, posts: 66, today: 3, latest_title: "Java版快照 Minecraft 快照 25w ...", latest_url: "/forum/1", comments: 15, likes: 98 },
        { id: 2, name: "美图分享", name_abbr: "图", color: COLORS[1], topics: 43, posts: 116, today: 5, latest_title: "分享近500张PC动漫壁纸，...", latest_url: "/forum/2", comments: 23, likes: 156 },
        { id: 3, name: "工单发布", name_abbr: "工", color: COLORS[2], topics: 5, posts: 11, today: 0, latest_title: "科普 腾龙游戏手机上怎么联系到 ...", latest_url: "/forum/3", comments: 8, likes: 42 },
        { id: 4, name: "软件资源", name_abbr: "软", color: COLORS[3], topics: 82, posts: 179, today: 2, latest_title: "DOSBox-X模拟器 DOS模拟器最新版 ...", latest_url: "/forum/4", comments: 31, likes: 267 },
        { id: 5, name: "人才市场", name_abbr: "才", color: COLORS[4], topics: 14, posts: 44, today: 1, latest_title: "云环工作室招模组师和材质包插件 ...", latest_url: "/forum/5", comments: 12, likes: 89 },
        { id: 6, name: "闲聊灌水", name_abbr: "聊", color: COLORS[5], topics: 1225, posts: "1万", today: 48, latest_title: "MCJPG 组织入驻 小僵尸论坛啦 ...", latest_url: "/forum/6", comments: 156, likes: 892 },
      ],
    }
    setData(mock)
    setLoading(false)
  }, [cid])

  if (loading) return <div className="cat-loading">加载中...</div>
  if (!data) return <div className="cat-error">分区不存在</div>

  return (
    <>
      {/* 面包屑 */}
      <div className="cat-breadcrumb">
        <Link href="/forum" className="cat-crumb-link">论坛首页</Link>
        <span className="cat-crumb-sep">/</span>
        <span className="cat-crumb-current">{data.name}</span>
      </div>

      {/* 分区头部 */}
      <div className="cat-header">
        <div className="cat-header-left">
          <h1 className="cat-title">{data.name}</h1>
          <p className="cat-stats">
            包含 {data.forum_count} 个子版块 · 主题 {data.total_topics} · 帖数 {data.total_posts}
          </p>
        </div>
        <div className="cat-header-actions">
          <button className="cat-btn-outline">简介</button>
          <button className="cat-btn-primary">版规</button>
        </div>
      </div>

      {/* 子版块网格 */}
      <div className="cat-forum-grid">
        {data.forums.map((forum) => (
          <Link key={forum.id} href={forum.latest_url} className="cat-forum-card no-underline">
            <div className="cat-forum-icon" style={{ background: `${forum.color}15`, color: forum.color }}>
              {forum.name_abbr}
            </div>
            <div className="cat-forum-body">
              <h3 className="cat-forum-name">{forum.name}</h3>
              <p className="cat-forum-stats">
                主题 {forum.topics} · 帖数 {forum.posts} · 今日 {forum.today}
              </p>
              <p className="cat-forum-latest">
                <span>最新帖</span> {forum.latest_title}
              </p>
            </div>
            <div className="cat-forum-interact">
              <span className="cat-interact-item" title="评论">💬 {forum.comments}</span>
              <span className="cat-interact-item" title="点赞">👍 {forum.likes}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* 版主列表 */}
      {data.moderators.length > 0 && (
        <div className="cat-moderators">
          <h3 className="cat-mod-title">版主列表</h3>
          <div className="cat-mod-list">
            {data.moderators.map((mod) => (
              <Link key={mod.name} href={mod.url} className="cat-mod-card no-underline">
                <div className="cat-mod-avatar">{mod.initial}</div>
                <span className="cat-mod-name">{mod.name}</span>
                <span className="cat-mod-badge">版主</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
