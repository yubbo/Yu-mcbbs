// app/install/page.tsx — 安装引导页
// LangProvider 包裹整个安装向导，提供多语言支持

import { LangProvider } from "@/core/lang"
import { InstallWizard } from "@/modules/install/InstallWizard"

export default function InstallPage() {
  return (
    <LangProvider>
      <InstallWizard />
    </LangProvider>
  )
}
