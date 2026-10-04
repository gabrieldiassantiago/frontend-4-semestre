"use client"

import { useCallback, useSyncExternalStore } from "react"

const STORAGE_KEY = "selecta:sidebar-collapsed"
const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  window.addEventListener("storage", listener)
  return () => {
    listeners.delete(listener)
    window.removeEventListener("storage", listener)
  }
}

const getSnapshot = () => window.localStorage.getItem(STORAGE_KEY) === "1"
const getServerSnapshot = () => false

/** Preferência visual (não é dado do usuário): lembra se a sidebar está recolhida. */
export function useSidebarCollapsed() {
  const collapsed = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const setCollapsed = useCallback((value: boolean) => {
    window.localStorage.setItem(STORAGE_KEY, value ? "1" : "0")
    listeners.forEach((listener) => listener())
  }, [])

  return [collapsed, setCollapsed] as const
}
