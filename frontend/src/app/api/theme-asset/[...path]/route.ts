/**
 * GET /api/theme-asset/[...path]
 *
 * 主题静态资源分发 —— 不让浏览器直接访问 themes/ 目录。
 * 例：浏览器请求 /api/theme-asset/default/modules/style/light.css
 *     → 服务端读 themes/default/modules/style/light.css → 返回内容
 */

import { NextRequest, NextResponse } from "next/server"
import { existsSync, readFileSync } from "fs"
import path from "path"

const THEMES_DIR = path.resolve(process.cwd(), "themes")

const MIME_TYPES: Record<string, string> = {
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".tpl": "text/plain",
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params

  // 安全检查：禁止 .. 路径穿越
  if (segments.some((s) => s.includes(".."))) {
    return new NextResponse("Forbidden", { status: 403 })
  }

  const filePath = path.join(THEMES_DIR, ...segments)
  const resolvedPath = path.resolve(filePath)
  // 二次验证：确保解析后的绝对路径仍在 themes/ 目录内
  if (!resolvedPath.startsWith(THEMES_DIR + path.sep)) {
    return new NextResponse("Forbidden", { status: 403 })
  }

  if (!existsSync(resolvedPath)) {
    return new NextResponse("Not Found", { status: 404 })
  }

  const ext = path.extname(resolvedPath).toLowerCase()
  const contentType = MIME_TYPES[ext] || "application/octet-stream"

  try {
    const content = readFileSync(resolvedPath)
    return new NextResponse(content, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600",
      },
    })
  } catch {
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
