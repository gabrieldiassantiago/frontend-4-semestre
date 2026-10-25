"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { completeOAuthLoginAction } from "@/actions/auth"

export function OAuthCallback() {
  const router = useRouter()
  const ran = useRef(false)

  useEffect(() => {
    if (ran.current) return
    ran.current = true

    const params = new URLSearchParams(window.location.hash.replace(/^#/, ""))
    const token = params.get("token")
    const refresh = params.get("refresh")
    const expires = Number(params.get("expires")) || undefined

    window.history.replaceState(null, "", window.location.pathname)

    if (!token || !refresh) {
      router.replace("/auth/candidato?oauthError=oauth_failed")
      return
    }

    completeOAuthLoginAction(token, refresh, expires).then((result) => {
      if (!result.ok) {
        router.replace("/auth/candidato?oauthError=oauth_failed")
        return
      }
      window.location.replace("/dashboard")
    })
  }, [router])

  return (
    <main className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">

    </main>
  )
}