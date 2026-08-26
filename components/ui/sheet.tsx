"use client"

import { useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const SIDES = {
  left: {
    container: "justify-start",
    panel: "h-full w-[min(20rem,88vw)] rounded-r-panel",
    initial: { x: "-100%" },
  },
  right: {
    container: "justify-end",
    panel: "h-full w-[min(26rem,92vw)] rounded-l-panel",
    initial: { x: "100%" },
  },
  bottom: {
    container: "items-end",
    panel: "max-h-[88vh] w-full rounded-t-panel",
    initial: { y: "100%" },
  },
} as const

/**
 * Painel deslizante para telas pequenas (filtros, detalhes).
 * Fecha no Escape e no clique do fundo, e bloqueia o scroll da página.
 */
export function Sheet({
  open,
  onClose,
  side = "bottom",
  title,
  className,
  children,
}: {
  open: boolean
  onClose: () => void
  side?: keyof typeof SIDES
  title: string
  className?: string
  children: React.ReactNode
}) {
  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }

    document.addEventListener("keydown", onKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    return () => {
      document.removeEventListener("keydown", onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [open, onClose])

  const config = SIDES[side]

  return (
    <AnimatePresence>
      {open && (
        <div className={cn("fixed inset-0 z-50 flex", config.container, className)}>
          <motion.button
            type="button"
            aria-label="Fechar"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 cursor-default bg-foreground/40 backdrop-blur-[2px]"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={config.initial}
            animate={{ x: 0, y: 0 }}
            exit={config.initial}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className={cn("relative flex flex-col bg-card shadow-overlay", config.panel)}
          >
            <header className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
              <h2 className="text-sm font-bold text-foreground">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar"
                className="grid size-9 place-items-center rounded-full text-strong-foreground transition-colors hover:bg-muted"
              >
                <X className="size-4" />
              </button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
