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
      aria-labelledby={`${id}-title`}
      className={cn(
        "scroll-mt-24 rounded-card border bg-card shadow-card",
        danger ? "border-danger-border" : "border-border",
      )}
    >
      <header className="flex items-start gap-4 border-b border-border-subtle p-5 sm:p-6">
        <span
          className={cn(
            "grid size-10 shrink-0 place-items-center rounded-xl",
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
      <div className="p-5 sm:p-6">{children}</div>
      {footer && (
        <footer className="flex flex-col-reverse gap-2 border-t border-border-subtle bg-muted/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-6">
          {footer}
        </footer>
      )}
    </section>
  )
}

/** Interruptor visual (somente UI). */
export function SettingsSwitch({ checked, label }: { checked: boolean; label: string }) {
  return (
    <span
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
        checked ? "bg-primary" : "bg-border-strong",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "inline-block size-5 rounded-full bg-background shadow-card transition-transform",
          checked ? "translate-x-[22px]" : "translate-x-0.5",
        )}
      />
    </span>
  )
}

/** Linha com título, descrição e um controle à direita. */
export function SettingsRow({
  title,
  description,
  control,
  className,
}: {
  title: string
  description?: string
  control: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 border-b border-border-subtle py-4 first:pt-0 last:border-0 last:pb-0",
        className,
      )}
    >
      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {description && <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground text-pretty">{description}</p>}
      </div>
      <div className="shrink-0">{control}</div>
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
