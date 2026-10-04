"use client"

import { useEffect, useState, useSyncExternalStore } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { Check, X } from "lucide-react"
import { dismissToast, getServerToasts, getToasts, subscribeToasts, type SuccessToast } from "@/lib/toast"

function ToastCard({ toast }: { toast: SuccessToast }) {
  const reduceMotion = useReducedMotion()
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    if (hovered || focused) return
    const timer = window.setTimeout(() => dismissToast(toast.id), 4500)
    return () => window.clearTimeout(timer)
  }, [toast.id, hovered, focused])

  return (
    <motion.div layout={!reduceMotion} initial={{ opacity: 0, y: reduceMotion ? 0 : -16, scale: reduceMotion ? 1 : 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: reduceMotion ? 0 : -8, scale: reduceMotion ? 1 : 0.98 }} transition={{ duration: reduceMotion ? 0 : 0.22 }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onFocusCapture={() => setFocused(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false) }}
      className="pointer-events-auto flex w-full items-center gap-3 rounded-2xl border border-success-border bg-background p-2 pl-4 shadow-raised">
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-success-subtle text-success-foreground"><Check className="size-5" aria-hidden /></span>
      <p className="min-w-0 flex-1 break-words text-sm font-medium leading-5 text-foreground">{toast.message}</p>
      <button type="button" onClick={() => dismissToast(toast.id)} aria-label={`Fechar aviso: ${toast.message}`} className="grid size-11 shrink-0 place-items-center rounded-xl text-muted-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-primary"><X className="size-4" aria-hidden /></button>
    </motion.div>
  )
}

export function ToastViewport() {
  const toasts = useSyncExternalStore(subscribeToasts, getToasts, getServerToasts)
  return (
    <div role="region" aria-label="Notificações" aria-live="polite" aria-relevant="additions text" className="pointer-events-none fixed inset-x-0 top-[max(12px,env(safe-area-inset-top))] z-[200] mx-auto flex w-[calc(100%-32px)] max-w-sm flex-col gap-2">
      <AnimatePresence initial={false}>{toasts.map((toast) => <ToastCard key={toast.id} toast={toast} />)}</AnimatePresence>
    </div>
  )
}
