"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { completeOAuthLoginAction } from "@/actions/auth"
import { loginDestination, profileDestination } from "@/lib/auth-flow"

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
    // A API marca `novo=1` quando o login social acabou de criar o perfil do candidato.
    const novo = params.get("novo") === "1"

    window.history.replaceState(null, "", window.location.pathname)

    if (!token || !refresh) {
      router.replace("/auth/candidato?oauthError=oauth_failed")
      return
    }

    completeOAuthLoginAction(token, refresh, expires).then(async (result) => {
      if (!result.ok) {
        router.replace("/auth/candidato?oauthError=oauth_failed")
        return
      }
      // Conta nova vai direto para as boas-vindas; as demais vão para o início,
      // onde o card de perfil lembra o que falta preencher.
      const destino = novo
        ? profileDestination("CANDIDATE", true)
        : await loginDestination("CANDIDATE")
      window.location.replace(destino)
    })
  }, [router])

  return (
    <main className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
      <span role="status">Entrando na sua conta…</span>
    </main>
  )
}