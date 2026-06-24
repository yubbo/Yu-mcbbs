/**
 * GET /api/component-asset/[...path]
 *
 * 框架组件静态资源分发。
 * 使主题模板可引用 src/components/ 下的资源文件。
 */

import { NextRequest, NextResponse } from "next/server"
import { existsSync, readFileSync } from "fs"
import path from "path"

const COMPONENTS_DIR = path.join(process.cwd(), "src", "components")

const MIME_TYPES: Record<string, string> = {
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params

  if (segments.some((s) => s.includes(".."))) {
    return new NextResponse("Forbidden", { status: 403 })
  }

  const filePath = path.join(COMPONENTS_DIR, ...segments)
  if (!existsSync(filePath)) {
    return new NextResponse("Not Found", { status: 404 })
  }

  const ext = path.extname(filePath).toLowerCase()
  const contentType = MIME_TYPES[ext] || "application/octet-stream"

  try {
    return new NextResponse(readFileSync(filePath), {
      headers: { "Content-Type": contentType, "Cache-Control": "public, max-age=3600" },
    })
  } catch {
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
