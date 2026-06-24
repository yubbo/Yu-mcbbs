// app/(userpanel)/user/settings/page.tsx — /user/settings 默认重定向

import { redirect } from "next/navigation"

export default function SettingsPage() {
  redirect("/user/settings/avatar")
}
