// app/(adminpanel)/admin/settings/ui/theme/page.tsx — 主题首页
// 路由重定向到模块子页

import { redirect } from "next/navigation"

export default function ThemePage() {
  redirect("/admin/settings/ui/theme/modules")
}
