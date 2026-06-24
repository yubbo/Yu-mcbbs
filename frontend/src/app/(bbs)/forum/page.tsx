// app/bbs/page.tsx — 论坛首页 (服务端组件)
// 使用主题模板引擎渲染 bbs/index.tpl

import { loadTemplate, render } from "@/core/theme"
import BbsClient from "./BbsClient"

export default function BbsHomePage() {
  const activeTheme: string | null = null // 使用默认主题

  const template = loadTemplate(activeTheme, "bbs/index.html")
  if (!template) {
    return (
      <div className="forum-home">
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--color-text-muted)" }}>
          模板文件未找到: themes/default/bbs/index.html
        </div>
      </div>
    )
  }

  const html = render(template, {
    page_title: "论坛首页",

    // 轮播图
    carousels: [
      { image: "/images/carousel_1.jpg", link: "/forum", title: "轮播图 1", active: true },
      { image: "/images/carousel_2.jpg", link: "/forum", title: "轮播图 2", active: false },
      { image: "/images/carousel_3.jpg", link: "/forum", title: "轮播图 3", active: false },
      { image: "/images/carousel_4.jpg", link: "/forum", title: "轮播图 4", active: false },
    ],

    // 顶部缩略图
    thumbnails: [],

    // 分类导航
    categories: [
      { id: "latest", name: "最新贴", active: true },
      { id: "hot", name: "最热贴", active: false },
      { id: "today", name: "今天活跃", active: false },
      { id: "essence", name: "精华贴", active: false },
    ],

    // 当前分类帖子
    catPosts: [
      { id: 1, title: "Go 并发模型深度解析：Goroutine 实践指南", url: "#", active: true },
      { id: 2, title: "Next.js 16 新特性全览", url: "#", active: false },
      { id: 3, title: "微服务分布式事务方案总结", url: "#", active: false },
      { id: 4, title: "Redis 高可用集群搭建实战", url: "#", active: false },
    ],

    // 版块分区
    active_tab: "zones",
    zones: [
      {
        id: 1,
        name: "综合分区",
        url: "/forum/category/1",
        color: "var(--color-primary)",
        forum_count: 6,
        total_topics: 1398,
        total_posts: "1.4万",
        moderators: [
          { name: "ZhanxKer", url: "#", initial: "Z" },
          { name: "风纪委员", url: "#", initial: "风" },
        ],
        forums: [
          {
            id: 1, name: "新闻资讯", name_abbr: "新", url: "/forum/1", card_color: "#534AB7",
            icon: "", topics: 29, posts: 66, today: 3,
            latest_title: "Java版快照 Minecraft 快照 25w ...",
            latest_url: "/forum/1", latest_author: "人工智***", latest_author_url: "#",
            latest_time: "2026-4-20 11:44", comments: 15, likes: 98,
          },
          {
            id: 2, name: "美图分享", name_abbr: "图", url: "/forum/2", card_color: "#D4537E",
            icon: "", topics: 43, posts: 116, today: 5,
            latest_title: "分享近500张PC动漫壁纸，...",
            latest_url: "/forum/2", latest_author: "ac***", latest_author_url: "#",
            latest_time: "2025-10-26 20:59", comments: 23, likes: 156,
          },
          {
            id: 3, name: "工单发布", name_abbr: "工", url: "/forum/3", card_color: "#185FA5",
            icon: "", topics: 5, posts: 11, today: 0,
            latest_title: "科普 腾龙游戏手机上怎么联系到 ...",
            latest_url: "/forum/3", latest_author: "小***", latest_author_url: "#",
            latest_time: "2026-4-12 17:23", comments: 8, likes: 42,
          },
          {
            id: 4, name: "软件资源", name_abbr: "软", url: "/forum/4", card_color: "#3B6D11",
            icon: "", topics: 82, posts: 179, today: 2,
            latest_title: "DOSBox-X模拟器 DOS模拟器最新版 ...",
            latest_url: "/forum/4", latest_author: "81114***", latest_author_url: "#",
            latest_time: "2026-4-10 15:44", comments: 31, likes: 267,
          },
          {
            id: 5, name: "人才市场", name_abbr: "才", url: "/forum/5", card_color: "#BA7517",
            icon: "", topics: 14, posts: 44, today: 1,
            latest_title: "云环工作室招模组师和材质包插件 ...",
            latest_url: "/forum/5", latest_author: "风纪***", latest_author_url: "#",
            latest_time: "2025-12-9 19:02", comments: 12, likes: 89,
          },
          {
            id: 6, name: "闲聊灌水", name_abbr: "聊", url: "/forum/6", card_color: "#E24B4A",
            icon: "", topics: 1225, posts: "1万", today: 48,
            latest_title: "MCJPG 组织入驻 小僵尸论坛啦 ...",
            latest_url: "/forum/6", latest_author: "人工智***", latest_author_url: "#",
            latest_time: "2026-4-20 11:44", comments: 156, likes: 892,
          },
        ],
      },
    ],

    // 侧边栏
    sidebar_on: true,
    sections: [
      { id: 1, name: "后端开发", url: "/forum/1", count: 128, hot: false },
      { id: 2, name: "前端开发", url: "/forum/2", count: 96, hot: true },
      { id: 3, name: "AI & 机器学习", url: "/forum/3", count: 54, hot: false },
      { id: 4, name: "架构设计", url: "/forum/4", count: 37, hot: false },
    ],

    // 排行榜
    rank_tabs: [
      { id: "contribution", name: "贡献榜", active: true },
      { id: "activity", name: "活跃榜", active: false },
      { id: "newcomer", name: "新人榜", active: false },
    ],
    rankings: [
      { rank: 1, name: "二鱼", initial: "鱼", score: "1,234 贡献值", avatar: "" },
      { rank: 2, name: "小布", initial: "布", score: "986 贡献值", avatar: "" },
      { rank: 3, name: "码农", initial: "码", score: "756 贡献值", avatar: "" },
      { rank: 4, name: "Alice", initial: "A", score: "542 贡献值", avatar: "" },
      { rank: 5, name: "Bob", initial: "B", score: "431 贡献值", avatar: "" },
      { rank: 6, name: "Carol", initial: "C", score: "389 贡献值", avatar: "" },
    ],
  })

  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: html }} />
      <BbsClient />
    </>
  )
}
