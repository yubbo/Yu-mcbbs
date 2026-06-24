"use client"

// app/(userpanel)/user/settings/profile/page.tsx — 个人资料

import { useEffect, useState } from "react"
import { getToken } from "@/lib/auth"
import { parseJwtPayload } from "@/lib/hooks/useJwtPayload"
import { ProfileForm } from "@/modules/userpanel/settings/ProfileForm"

export default function ProfilePage() {
  const [user, setUser] = useState({ id: 0, username: "", email: "", nickname: "" })

  useEffect(() => {
    const token = getToken()
    if (token) {
      const payload = parseJwtPayload(token)
      if (payload) {
        setUser({
          id: payload.user_id || 0,
          username: payload.username || "",
          email: "",
          nickname: "",
        })
      }
    }
  }, [])

  return <ProfileForm user={user} />
}
