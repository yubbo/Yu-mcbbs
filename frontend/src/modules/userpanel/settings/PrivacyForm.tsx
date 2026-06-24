"use client"

// modules/userpanel/settings/PrivacyForm.tsx — 隐私设置表单

import { Label } from "@/components/ui/label"

const PRIVACY_OPTIONS = [
  { key: "profile_visible", label: "个人资料可见性", options: ["所有人", "仅登录用户", "仅自己"] },
  { key: "email_visible", label: "邮箱可见性", options: ["所有人", "仅好友", "仅自己"] },
  { key: "online_visible", label: "在线状态可见性", options: ["所有人", "仅好友", "隐藏"] },
]

export function PrivacyForm() {
  return (
    <div className="space-y-5">
      {PRIVACY_OPTIONS.map((item) => (
        <div key={item.key} className="space-y-2">
          <Label>{item.label}</Label>
          <select
            disabled
            className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-500 outline-none cursor-not-allowed"
            defaultValue={item.options[0]}
          >
            {item.options.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      ))}
      <p className="text-xs text-zinc-400">
        隐私设置功能正在开发中，暂不可用
      </p>
    </div>
  )
}
