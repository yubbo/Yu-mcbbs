"use client"

// app/(userpanel)/user/settings/deactivate/page.tsx — 账号注销

import { useEffect, useState } from "react"
import { getToken } from "@/lib/auth"
import { DeactivateView } from "@/modules/userpanel/settings/DeactivateView"

export default function DeactivatePage() {
  const [username, setUsername] = useState("")

  useEffect(() => {
    const token = getToken()
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]))
        setUsername(payload.username || "")
      } catch {}
    }
  }, [])

  return <DeactivateView username={username} />
}
