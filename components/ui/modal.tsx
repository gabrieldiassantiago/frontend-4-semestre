"use client"

import { useEffect, useId, useRef } from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import type { LucideIcon } from "lucide-react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Diálogo padrão da aplicação.
 * - Desktop: centralizado, com cabeçalho, corpo rolável e rodapé fixo.
 * - Mobile: ancorado embaixo (bottom sheet), com alça e respeitando a safe area.
 * Cuida de foco (trap + restauração), Esc, scroll lock e nomes acessíveis.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  icon: Icon,
  header,
  headerActions,
  footer,
  footerStart,
  size = "md",
  hideHeader = false,
  className,
  bodyClassName,
  children,
}: {
  open: boolean
  onClose: () => void
  /** Sempre obrigatório: é o nome acessível do diálogo. */
  title: string
  description?: string
  icon?: LucideIcon
  /** Substitui o título/descrição padrão quando o fluxo precisa de mais contexto. */
  header?: React.ReactNode
  /** Ações extras ao lado do botão de fechar (ex.: "Limpar"). */
  headerActions?: React.ReactNode
  footer?: React.ReactNode
  /** Conteúdo alinhado à esquerda no rodapé (ex.: contagem de resultados). */
  footerStart?: React.ReactNode
  size?: "sm" | "md" | "lg" | "xl"
  /** Para conteúdos que já trazem cabeçalho próprio (ex.: detalhes da vaga). */
  hideHeader?: boolean
  className?: string
  bodyClassName?: string
  children: React.ReactNode
}) {
  const titleId = useId()
  const descriptionId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)
  const onCloseRef = useRef(onClose)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!open) return

    const previouslyFocused = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    const focusTimer = window.setTimeout(() => {
      const dialog = dialogRef.current
      if (!dialog) return
      const preferred = dialog.querySelector<HTMLElement>("[data-autofocus]")
      ;(preferred ?? dialog).focus({ preventScroll: true })
    }, 30)

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation()
        onCloseRef.current()
        return
      }
      if (event.key !== "Tab" || !dialogRef.current) return

      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null,
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.current)) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener("keydown", onKeyDown)

    return () => {
      window.clearTimeout(focusTimer)
      document.removeEventListener("keydown", onKeyDown)
      document.body.style.overflow = previousOverflow
      previouslyFocused?.focus?.({ preventScroll: true })
    }
  }, [open])

  if (typeof document === "undefined") return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
          <motion.div
            aria-hidden
            onClick={() => onCloseRef.current()}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-0 bg-foreground/40 backdrop-blur-[2px]"
          />

          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={hideHeader ? undefined : titleId}
            aria-label={hideHeader ? title : undefined}
            aria-describedby={description && !header && !hideHeader ? descriptionId : undefined}
            tabIndex={-1}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
            transition={{ type: "spring", damping: 32, stiffness: 340 }}
            className={cn(
              "relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl border border-border bg-card shadow-overlay outline-none sm:max-h-[88vh] sm:rounded-2xl",
              size === "sm" && "sm:max-w-md",
              size === "md" && "sm:max-w-xl",
              size === "lg" && "sm:max-w-2xl",
              size === "xl" && "sm:max-w-3xl",
              className,
            )}
          >
            <div aria-hidden className="flex justify-center pt-2.5 sm:hidden">
              <span className="h-1 w-10 rounded-full bg-border-strong" />
            </div>

            {!hideHeader && (
              <header className="flex items-start gap-3 border-b border-border-subtle px-5 pb-4 pt-3 sm:gap-4 sm:px-6 sm:pt-5">
                {Icon && !header && (
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-border-subtle bg-surface text-primary">
                    <Icon className="size-5" aria-hidden />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  {header ? (
                    <div id={titleId}>{header}</div>
                  ) : (
                    <>
                      <h2 id={titleId} className="text-base font-semibold tracking-tight text-foreground text-pretty sm:text-lg">
                        {title}
                      </h2>
                      {description && (
                        <p id={descriptionId} className="mt-0.5 text-sm leading-relaxed text-muted-foreground text-pretty">
                          {description}
                        </p>
                      )}
                    </>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-1.5">
                  {headerActions}
                  <button
                    type="button"
                    onClick={() => onCloseRef.current()}
                    aria-label="Fechar"
                    className="grid size-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  >
                    <X className="size-[18px]" aria-hidden />
                  </button>
                </div>
              </header>
            )}

            <div className={cn("min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6", bodyClassName)}>
              {children}
            </div>

            {footer && (
              <footer className="flex flex-col-reverse gap-2 border-t border-border-subtle bg-surface px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:flex-row sm:items-center sm:gap-3 sm:px-6 sm:pb-4">
                {footerStart && (
                  <div className="hidden min-w-0 flex-1 text-sm text-muted-foreground sm:block">{footerStart}</div>
                )}
                <div className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:items-center", !footerStart && "sm:ml-auto")}>
                  {footer}
                </div>
              </footer>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
