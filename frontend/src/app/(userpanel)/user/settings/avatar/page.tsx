"use client"

// app/(userpanel)/user/settings/avatar/page.tsx — 修改头像

import { useEffect, useState } from "react"
import { getToken } from "@/lib/auth"
import { parseJwtPayload } from "@/lib/hooks/useJwtPayload"
import { AvatarForm } from "@/modules/userpanel/settings/AvatarForm"

export default function AvatarPage() {
  const [user, setUser] = useState({ id: 0, username: "", avatar: "" })

  useEffect(() => {
    const token = getToken()
    if (token) {
      const payload = parseJwtPayload(token)
      if (payload) {
        setUser({
          id: payload.user_id || 0,
          username: payload.username || "",
          avatar: "",
        })
      }
    }
  }, [])

  return <AvatarForm user={user} />
}
