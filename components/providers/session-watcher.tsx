"use client"

import { useEffect, useEffectEvent } from "react"
import { usePathname } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import {
  buildLoginRedirect,
  isProtectedPath,
  isSessionExpired,
  readSessionClaims,
} from "@/lib/session"

const AUTH_COOKIE = "token"
const CHECK_INTERVAL_MS = 30_000

function readTokenCookie() {
  const entry = document.cookie.split("; ").find((item) => item.startsWith(`${AUTH_COOKIE}=`))
  return entry ? decodeURIComponent(entry.slice(AUTH_COOKIE.length + 1)) : null
}

export function redirectToLogin(queryClient?: { clear: () => void }) {
  queryClient?.clear()
  const from = `${window.location.pathname}${window.location.search}`
  // Navegação completa: garante que o proxy rode e descarte o cookie vencido.
  window.location.replace(buildLoginRedirect(from))
}

/**
 * O proxy só roda em navegações. Este observador cobre quem fica parado numa
 * tela protegida enquanto o token vence: ao expirar, leva a pessoa ao login.
 */
export function SessionWatcher() {
  const pathname = usePathname()
  const queryClient = useQueryClient()

  const checkSession = useEffectEvent(() => {
    if (!isProtectedPath(window.location.pathname)) return
    const token = readTokenCookie()
    if (!token || isSessionExpired(readSessionClaims(token))) redirectToLogin(queryClient)
  })

  useEffect(() => {
    if (!isProtectedPath(pathname)) return

    checkSession()

    const token = readTokenCookie()
    const expiresAt = token ? readSessionClaims(token)?.expiresAt : null
    const msUntilExpiry = expiresAt ? expiresAt - Date.now() : null

    // setTimeout estoura acima de ~24 dias; o intervalo cobre esses casos.
    const timeout =
      msUntilExpiry !== null && msUntilExpiry > 0 && msUntilExpiry < 2 ** 31 - 1
        ? window.setTimeout(checkSession, msUntilExpiry)
        : undefined
    const interval = window.setInterval(checkSession, CHECK_INTERVAL_MS)

    function onVisible() {
      if (document.visibilityState === "visible") checkSession()
    }
    document.addEventListener("visibilitychange", onVisible)
    window.addEventListener("focus", checkSession)

    return () => {
      window.clearTimeout(timeout)
      window.clearInterval(interval)
      document.removeEventListener("visibilitychange", onVisible)
      window.removeEventListener("focus", checkSession)
    }
  }, [pathname])

  return null
}
