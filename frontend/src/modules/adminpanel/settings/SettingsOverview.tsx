// modules/adminpanel/settings/SettingsOverview.tsx — 站点设置入口

import Link from "next/link"

export function SettingsOverview() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">站点设置</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/admin/settings/global/site" className="rounded-xl border p-6 hover:border-primary transition-colors no-underline">
          <h3 className="font-semibold text-base">全局设置</h3>
          <p className="text-sm text-muted-foreground mt-1">站点名称、描述、Logo、favicon</p>
        </Link>
        <Link href="/admin/settings/global/register" className="rounded-xl border p-6 hover:border-primary transition-colors no-underline">
          <h3 className="font-semibold text-base">注册设置</h3>
          <p className="text-sm text-muted-foreground mt-1">注册开关、验证方式、默认角色</p>
        </Link>
        <Link href="/admin/settings/global/features" className="rounded-xl border p-6 hover:border-primary transition-colors no-underline">
          <h3 className="font-semibold text-base">功能开关</h3>
          <p className="text-sm text-muted-foreground mt-1">论坛、博客、AI、支付等功能启停</p>
        </Link>
        <Link href="/admin/settings/ui/navigation/main" className="rounded-xl border p-6 hover:border-primary transition-colors no-underline">
          <h3 className="font-semibold text-base">导航管理</h3>
          <p className="text-sm text-muted-foreground mt-1">PC 主导航、顶部、底部，手机导航</p>
        </Link>
        <Link href="/admin/settings/ui/layout" className="rounded-xl border p-6 hover:border-primary transition-colors no-underline">
          <h3 className="font-semibold text-base">界面布局</h3>
          <p className="text-sm text-muted-foreground mt-1">全宽/窄宽、侧边栏位置</p>
        </Link>
        <Link href="/admin/settings/ui/theme" className="rounded-xl border p-6 hover:border-primary transition-colors no-underline">
          <h3 className="font-semibold text-base">主题设置</h3>
          <p className="text-sm text-muted-foreground mt-1">主题色、字体、暗色模式</p>
        </Link>
      </div>
    </div>
  )
}
