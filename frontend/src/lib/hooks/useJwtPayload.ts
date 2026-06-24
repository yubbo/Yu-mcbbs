// lib/hooks/useJwtPayload.ts — 客户端 JWT Token 解析 Hook
// 从 token 中提取 user_id / username / role，统一解析逻辑

"use client"

import { useMemo } from "react"
import { getToken } from "@/lib/auth"

interface JwtPayload {
  user_id: number
  username: string
  role: string
}

/** 从 JWT token 中解析 payload */
function parsePayload(token: string): JwtPayload | null {
  try {
    const payload = token.split(".")[1]
    return JSON.parse(atob(payload))
  } catch {
    return null
  }
}

/** 客户端 Hook：获取当前登录用户的 JWT payload */
export function useJwtPayload(): JwtPayload | null {
  return useMemo(() => {
    if (typeof window === "undefined") return null
    const token = getToken()
    if (!token) return null
    return parsePayload(token)
  }, [])
}

/** 纯函数版：直接从 token 字符串解析（服务端/客户端通用） */
export function parseJwtPayload(token: string): JwtPayload | null {
  return parsePayload(token)
}
