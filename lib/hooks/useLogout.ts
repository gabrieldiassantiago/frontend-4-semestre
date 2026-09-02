"use client"

import { useCallback } from "react"
import { useRouter } from "next/navigation"

export function useLogout(redirectTo: string) {
  const router = useRouter()

  return useCallback(() => {
    document.cookie = "token=; path=/; max-age=0; SameSite=Lax"
    router.push(redirectTo)
    router.refresh()
  }, [router, redirectTo])
}
