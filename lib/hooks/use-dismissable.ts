"use client"

import { useEffect, useRef, useState } from "react"

/**
 * Controla um elemento dispensável (dropdown, popover).
 * Fecha ao clicar fora e ao pressionar Escape — lógica que antes estava
 * duplicada em cada app shell.
 */
export function useDismissable<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }

    document.addEventListener("mousedown", onPointerDown)
    document.addEventListener("touchstart", onPointerDown)
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("mousedown", onPointerDown)
      document.removeEventListener("touchstart", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [open])

  return { ref, open, setOpen, toggle: () => setOpen((value) => !value), close: () => setOpen(false) }
}
