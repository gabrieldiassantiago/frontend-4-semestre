"use client"

import { useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Diálogo centralizado. Complementa o `Sheet` (que desliza pelas bordas):
 * fluxos com passos ficam melhor centralizados no desktop e ancorados
 * embaixo no mobile, onde a tela é estreita.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  header,
  footer,
  size = "md",
  className,
  children,
}: {
  open: boolean
  onClose: () => void
  /** Sempre obrigatório: é o nome acessível do diálogo. */
  title: string
  description?: string
  /** Substitui o cabeçalho padrão quando o fluxo precisa de mais contexto. */
  header?: React.ReactNode
  footer?: React.ReactNode
  size?: "sm" | "md" | "lg"
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

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
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
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: "spring", damping: 30, stiffness: 320 }}
            className={cn(
              "relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-panel bg-card shadow-overlay sm:rounded-panel",
              size === "sm" && "sm:max-w-md",
              size === "md" && "sm:max-w-xl",
              size === "lg" && "sm:max-w-3xl",
              className,
            )}
          >
            <header className="flex items-start gap-4 border-b border-border px-5 py-4 sm:px-6">
              <div className="min-w-0 flex-1">
                {header ?? (
                  <>
                    <h2 className="text-base font-bold tracking-tight text-foreground text-pretty">
                      {title}
                    </h2>
                    {description && (
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground text-pretty">
                        {description}
                      </p>
                    )}
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar"
                className="grid size-9 shrink-0 place-items-center rounded-full text-strong-foreground transition-colors hover:bg-muted"
              >
                <X className="size-4" />
              </button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>

            {footer && (
              <footer className="flex items-center justify-end gap-2.5 border-t border-border bg-surface px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6 sm:pb-4">
                {footer}
              </footer>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
