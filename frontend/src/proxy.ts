// proxy.ts — Next.js 全局代理（原 middleware）
//
// 职责：
//   1. 安装状态拦截 — 未安装时所有页面重定向到 /install
//   2. API 请求、静态资源由 matcher 排除，不受影响
//
// 注意：Next.js proxy 运行在 Edge Runtime，可使用 fetch。

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // /install 页面本身始终放行（包括子路径如 /install/xxx）
  if (pathname.startsWith("/install")) {
    return NextResponse.next()
  }

  // 其他所有页面 → 检查系统是否已安装
  // 直连本地后端，不走公网 URL（避免 ngrok 延迟叠加、拦截页等问题）
  try {
    const backendUrl = process.env.API_BACKEND_URL || "http://localhost:8080"
    const res = await fetch(`${backendUrl}/api/v1/install/check`, {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    })

    if (res.ok) {
      const body = await res.json()
      if (body?.data?.installed === true) {
        // 已安装 → 正常放行
        return NextResponse.next()
      }
    }
  } catch {
    // 后端不可达 → 视为未安装
  }

  // 未安装 → 重定向到安装向导
  return NextResponse.redirect(new URL("/install", request.url))
}

export const config = {
  // 排除 Next.js 内部资源、API 路由、静态文件
  matcher: ["/((?!_next|api|favicon.ico|.*\\.\\w+$).*)"],
}
