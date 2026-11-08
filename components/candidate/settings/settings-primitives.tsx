"use client"

import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

/** Painel de uma seção de configurações: cabeçalho com ícone + conteúdo. */
export function SettingsPanel({
  id,
  icon: Icon,
  title,
  description,
  tone = "default",
  children,
  footer,
}: {
  id: string
  icon: LucideIcon
  title: string
  description: string
  tone?: "default" | "danger"
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  const danger = tone === "danger"
  return (
    <section
      id={id}
      data-settings-section
      aria-labelledby={`${id}-title`}
      className={cn(
        "min-w-0 scroll-mt-36 overflow-hidden rounded-card border bg-card shadow-card lg:scroll-mt-24",
        danger ? "border-danger-border" : "border-border",
      )}
    >
      <header className="flex items-start gap-3 border-b border-border-subtle p-4 sm:gap-4 sm:p-6">
        <span
          className={cn(
            "grid size-9 shrink-0 place-items-center rounded-xl sm:size-10",
            danger ? "bg-danger-subtle text-danger-foreground" : "bg-primary-subtle text-primary-subtle-foreground",
          )}
        >
          <Icon aria-hidden className="size-[18px]" />
        </span>
        <div className="min-w-0">
          <h2 id={`${id}-title`} className="text-base font-semibold tracking-tight text-foreground">
            {title}
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground text-pretty">{description}</p>
        </div>
      </header>
      <div className="p-4 sm:p-6">{children}</div>
      {footer && (
        <footer className="flex flex-col-reverse gap-2 border-t border-border-subtle bg-muted/60 px-4 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-6">
          {footer}
        </footer>
      )}
    </section>
  )
}

/** Interruptor acessível (role="switch") controlado. */
export function SettingsSwitch({
  checked,
  label,
  onChange,
}: {
  checked: boolean
  label: string
  onChange: (checked: boolean) => void
}) {

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-card",
        checked ? "bg-primary" : "bg-border-strong",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "inline-block size-5 rounded-full bg-background shadow-card transition-transform duration-200",
          checked ? "translate-x-[22px]" : "translate-x-0.5",
        )}
      />
    </button>
  )
}

/**
 * Linha com título, descrição e um controle.
 * - `inline` (padrão p/ switches): controle sempre à direita.
 * - `stack`: no mobile o controle (botões) desce para baixo do texto.
 */
export function SettingsRow({
  title,
  description,
  control,
  layout = "inline",
  className,
}: {
  title: string
  description?: string
  control: React.ReactNode
  layout?: "inline" | "stack"
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex gap-3 border-b border-border-subtle py-4 first:pt-0 last:border-0 last:pb-0",
        layout === "stack"
          ? "flex-col sm:flex-row sm:items-center sm:justify-between sm:gap-6"
          : "items-center justify-between sm:gap-6",
        className,
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {description && <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground text-pretty">{description}</p>}
      </div>
      <div className={cn("shrink-0", layout === "stack" && "flex sm:block [&>*]:w-full sm:[&>*]:w-auto")}>{control}</div>
    </div>
  )
}

/** Campo com rótulo no padrão `.field-input`. */
export function SettingsField({
  id,
  label,
  hint,
  className,
  children,
}: {
  id: string
  label: string
  hint?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-semibold text-strong-foreground">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs leading-relaxed text-muted-foreground">{hint}</p>}
    </div>
  )
}
