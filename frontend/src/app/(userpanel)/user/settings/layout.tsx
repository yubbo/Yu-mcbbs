// app/(userpanel)/user/settings/layout.tsx — 账号设置布局
// 标题 + Tab 导航 + 内容区

import { SettingsTabs } from "./_components/SettingsTabs"

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-lg sm:text-xl font-bold text-zinc-900">账号设置</h1>
        <p className="mt-1 text-xs sm:text-sm text-zinc-500">管理你的账号信息、安全和偏好</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
        <SettingsTabs />
        <div className="flex-1 min-w-0 rounded-xl sm:rounded-2xl border border-zinc-200/80 bg-white p-4 sm:p-6 shadow-sm">
          {children}
        </div>
      </div>
    </div>
  )
}
