import Link from "next/link"

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-zinc-300 mb-4">404</h1>
        <h2 className="text-xl font-semibold text-zinc-800 mb-2">页面不存在</h2>
        <p className="text-sm text-zinc-500 mb-6 leading-relaxed">
          你访问的页面不存在或已被移除，请检查链接是否正确。
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-medium no-underline hover:bg-zinc-800 transition-colors"
          >
            返回首页
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center px-4 py-2 border border-zinc-200 text-zinc-700 rounded-lg text-sm font-medium no-underline hover:bg-zinc-50 transition-colors"
          >
            登录
          </Link>
        </div>
      </div>
    </div>
  )
}
