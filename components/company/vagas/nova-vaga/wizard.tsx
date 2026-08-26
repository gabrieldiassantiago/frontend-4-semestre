"use client"

import { useId } from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

/** Etapas do fluxo de publicação, na ordem em que aparecem. */
export const WIZARD_STEPS = [
  { label: "Cargo", title: "Cargo" },
  { label: "Local e salário", title: "Local e salário" },
  { label: "Benefícios", title: "Benefícios" },
  { label: "Descrição", title: "Descrição" },
] as const

export const TOTAL_STEPS = WIZARD_STEPS.length

/**
 * Trilha de progresso. Só permite navegar para etapas já visitadas, para que
 * ninguém pule uma validação usando a trilha como atalho.
 */
export function Stepper({
  current,
  maxReached,
  onSelect,
}: {
  current: number
  maxReached: number
  onSelect: (step: number) => void
}) {
  return (
    <ol className="flex list-none items-center gap-1.5">
      {WIZARD_STEPS.map((step, index) => {
        const number = index + 1
        const active = number === current
        const done = number < current
        const reachable = number <= maxReached

        return (
          <li key={step.label} className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={!reachable}
              aria-current={active ? "step" : undefined}
              onClick={() => onSelect(number)}
              className={cn(
                "flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3 text-xs font-bold transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                active && "bg-primary-subtle text-primary-subtle-foreground",
                !active && reachable && "text-strong-foreground hover:bg-muted",
                !reachable && "cursor-not-allowed text-subtle-foreground",
              )}
            >
              <span
                className={cn(
                  "grid size-6 shrink-0 place-items-center rounded-full text-[11px] transition-colors",
                  active && "bg-primary text-primary-foreground",
                  done && "bg-success text-strong-contrast",
                  !active && !done && "border border-border-strong",
                )}
              >
                {done ? <Check className="size-3.5" aria-hidden /> : number}
              </span>
              <span className="hidden sm:inline">{step.label}</span>
              <span className="sr-only sm:hidden">
                Passo {number}: {step.label}
              </span>
            </button>

            {number < TOTAL_STEPS && (
              <span
                aria-hidden
                className={cn("h-px w-4 lg:w-6", done ? "bg-success" : "bg-border")}
              />
            )}
          </li>
        )
      })}
    </ol>
  )
}

/** Cabeçalho padrão de cada etapa do wizard. */
export function StepHeader({
  step,
  title,
  description,
  action,
}: {
  step: number
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
          Passo {step} de {TOTAL_STEPS} • {WIZARD_STEPS[step - 1].label}
        </p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground text-balance sm:text-3xl">
          {title}
        </h2>
        {description && (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground text-pretty">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0 self-start sm:self-auto">{action}</div>}
    </div>
  )
}

/** Bloco de conteúdo de uma etapa. */
export function StepCard({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={cn("rounded-panel border border-border bg-card p-5 shadow-card sm:p-6", className)}
    >
      {children}
    </div>
  )
}

export interface Choice<T extends string> {
  value: T
  label: string
  description?: string
  icon?: React.ComponentType<{ className?: string }>
}

/**
 * Grupo de escolha única. Usa radios nativos (visualmente ocultos) para que
 * teclado e leitores de tela funcionem como em um radiogroup de verdade.
 */
export function RadioCards<T extends string>({
  legend,
  hint,
  options,
  value,
  onChange,
  columns = 1,
  className,
}: {
  legend: string
  hint?: string
  options: Choice<T>[]
  value: T
  onChange: (next: T) => void
  columns?: 1 | 2 | 3 | 4
  className?: string
}) {
  const name = useId()

  return (
    <fieldset className={className}>
      <legend className="text-sm font-bold text-strong-foreground">{legend}</legend>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}

      <div
        className={cn(
          "mt-3 grid gap-2.5",
          columns === 2 && "sm:grid-cols-2",
          columns === 3 && "sm:grid-cols-2 md:grid-cols-3",
          columns === 4 && "grid-cols-2 sm:grid-cols-3 md:grid-cols-4",
        )}
      >
        {options.map((option) => {
          const active = value === option.value
          const Icon = option.icon

          return (
            <label
              key={option.value}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition-colors",
                "focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 focus-within:ring-offset-card",
                active
                  ? "border-primary bg-primary-subtle text-primary-subtle-foreground"
                  : "border-border bg-surface text-strong-foreground hover:border-border-strong hover:bg-muted",
              )}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={active}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />

              {Icon && (
                <span
                  className={cn(
                    "grid size-10 shrink-0 place-items-center rounded-xl transition-colors",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-strong-foreground",
                  )}
                >
                  <Icon className="size-5" />
                </span>
              )}

              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold">{option.label}</span>
                {option.description && (
                  <span
                    className={cn(
                      "mt-0.5 block text-xs font-medium",
                      active ? "text-primary-subtle-foreground" : "text-muted-foreground",
                    )}
                  >
                    {option.description}
                  </span>
                )}
              </span>

              {active && <Check className="size-4 shrink-0" aria-hidden />}
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}

/** Item de seleção múltipla (benefícios). */
export function CheckCard({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: () => void
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center justify-between gap-3 rounded-xl border p-3.5 transition-colors",
        "focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 focus-within:ring-offset-card",
        checked
          ? "border-primary bg-primary-subtle text-primary-subtle-foreground"
          : "border-border bg-surface text-strong-foreground hover:border-border-strong hover:bg-muted",
      )}
    >
        <span className="min-w-0 text-xs font-semibold">{label}</span>

      <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />

      <span
        className={cn(
          "grid size-5 shrink-0 place-items-center rounded-full border transition-colors",
          checked ? "border-primary bg-primary text-primary-foreground" : "border-border-strong",
        )}
      >
        {checked && <Check className="size-3" aria-hidden />}
      </span>
    </label>
  )
}
