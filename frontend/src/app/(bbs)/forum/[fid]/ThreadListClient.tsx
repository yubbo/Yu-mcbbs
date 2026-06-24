"use client"

// ThreadListClient.tsx — 版块帖子列表客户端组件
// 负责：获取 API 数据、分页、React 渲染

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"

interface ThreadItem {
  id: number
  title: string
  author: string
  avatar: string
  view_count: number
  post_count: number
  like_count: number
  is_pinned: boolean
  created_at: string
  last_reply: string
  url: string
  preview: string
}

interface ListResult {
  list: ThreadItem[]
  total: number
  page: number
  size: number
}

export function ThreadListClient() {
  const params = useParams<{ fid: string }>()
  const fid = parseInt(params.fid || "1")

  const [data, setData] = useState<ListResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [error, setError] = useState("")

  const fetchThreads = useCallback(async (p: number) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/v1/forum/threads?fid=${fid}&page=${p}`)
      const body = await res.json()
      if (body.code === 0) {
        setData(body.data)
      } else {
        setError(body.message || "加载失败")
      }
    } catch {
      setError("网络请求失败")
    } finally {
      setLoading(false)
    }
  }, [fid])

  useEffect(() => {
    fetchThreads(page)
  }, [page, fetchThreads])

  // 分页切换
  const totalPages = data ? Math.ceil(data.total / data.size) : 0

  const goPage = (p: number) => {
    if (p >= 1 && p <= totalPages) setPage(p)
  }

  return (
    <>
      {/* 面包屑 */}
      <div className="thread-breadcrumb">
        <Link href="/forum" className="crumb-link">论坛首页</Link>
        <span className="crumb-sep">/</span>
        <span className="crumb-current">帖子列表</span>
      </div>

      {/* 帖子列表 */}
      <div className="thread-list">
        {loading ? (
          <div className="thread-loading">加载中...</div>
        ) : error ? (
          <div className="thread-error">{error}</div>
        ) : data && data.list.length > 0 ? (
          <>
            <div className="thread-items">
              {data.list.map((thread) => (
                <Link
                  key={thread.id}
                  href={thread.url}
                  className="thread-card no-underline"
                >
                  {thread.is_pinned && <span className="thread-pin-tag">置顶</span>}
                  <div className="thread-body">
                    <h3 className="thread-title">{thread.title}</h3>
                    <p className="thread-preview">{thread.preview}</p>
                    <div className="thread-meta">
                      <span className="thread-author">{thread.author}</span>
                      <span className="thread-time">{thread.created_at}</span>
                      {thread.last_reply && (
                        <span className="thread-last-reply">最后回复 {thread.last_reply}</span>
                      )}
                    </div>
                  </div>
                  <div className="thread-stats">
                    <span title="回复">{thread.post_count}</span>
                    <span title="浏览">{thread.view_count}</span>
                    <span title="点赞">{thread.like_count}</span>
                  </div>
                </Link>
              ))}
            </div>

            {/* 分页 */}
            {totalPages > 1 && (
              <div className="thread-pagination">
                <button
                  onClick={() => goPage(page - 1)}
                  disabled={page <= 1}
                  className="page-btn"
                >
                  « 上一页
                </button>
                <span className="page-info">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => goPage(page + 1)}
                  disabled={page >= totalPages}
                  className="page-btn"
                >
                  下一页 »
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="thread-empty">暂无帖子</div>
        )}
      </div>
    </>
  )
}
