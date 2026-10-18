"use client"

import { useId } from "react"
import { Check, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { useFlow } from "./flow-context"
import type { StepId } from "./types"

export const STEP_HEADING_ID = "nova-vaga-step-heading"

export function QuestionHeader({ stepId }: { stepId: StepId }) {
  const { steps, mode } = useFlow()
  const index = steps.findIndex((step) => step.id === stepId)
  const step = steps[index]

  return (
    <div className="mb-8">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
        {mode === "edit" ? `Editando · ${step.label}` : `Passo ${index + 1} de ${steps.length}`}
      </p>
      <h2
        id={STEP_HEADING_ID}
        tabIndex={-1}
        className="mt-2 text-2xl font-bold tracking-tight text-foreground text-balance outline-none sm:text-3xl"
      >
        {step.title}
      </h2>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground text-pretty sm:text-base">
        {step.description}
      </p>
    </div>
  )
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p role="alert" className="mt-2 text-sm font-medium text-danger-foreground">
      {message}
    </p>
  )
}

export interface TileOption<T extends string> {
  value: T
  label: string
  description?: string
  icon?: LucideIcon
}

/** Grupo de escolha única com radios nativos ocultos (teclado e leitor de tela funcionam). */
export function TileGroup<T extends string>({
  legend,
  options,
  value,
  onChange,
  className,
  gridClassName,
}: {
  legend: string
  options: TileOption<T>[]
  value: T
  onChange: (next: T) => void
  className?: string
  gridClassName?: string
}) {
  const name = useId()

  return (
    <fieldset className={className}>
      <legend className="mb-3 text-sm font-semibold text-strong-foreground">{legend}</legend>
      <div className={cn("grid gap-2.5", gridClassName)}>
        {options.map((option) => {
          const active = option.value === value
          const Icon = option.icon
          return (
            <label
              key={option.value}
              className={cn(
                "group relative flex cursor-pointer items-center gap-3 rounded-2xl border bg-card p-4 transition-all duration-200",
                "focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 focus-within:ring-offset-background",
                active
                  ? "border-primary shadow-[0_0_0_1px_var(--primary)]"
                  : "border-border hover:-translate-y-0.5 hover:border-border-strong hover:shadow-raised",
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
                    "grid size-10 shrink-0 place-items-center rounded-xl transition-colors duration-200",
                    active ? "bg-primary text-primary-foreground" : "bg-muted text-strong-foreground",
                  )}
                >
                  <Icon className="size-5" aria-hidden />
                </span>
              )}
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-foreground">{option.label}</span>
                {option.description && (
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {option.description}
                  </span>
                )}
              </span>
              <span
                aria-hidden
                className={cn(
                  "grid size-5 shrink-0 place-items-center rounded-full border transition-all duration-200",
                  active
                    ? "scale-100 border-primary bg-primary text-primary-foreground"
                    : "scale-90 border-border-strong text-transparent",
                )}
              >
                <Check className="size-3" />
              </span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}

/** Pílula de seleção (múltipla ou única). */
export function Chip({
  selected,
  onClick,
  children,
  className,
}: {
  selected: boolean
  onClick: () => void
  children: React.ReactNode
  className?: string
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition-all duration-200 active:scale-95",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        selected
          ? "border-primary bg-primary-subtle text-primary-subtle-foreground"
          : "border-border bg-card text-strong-foreground hover:border-border-strong hover:bg-muted",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "grid place-items-center overflow-hidden transition-all duration-200",
          selected ? "w-3.5 opacity-100" : "w-0 opacity-0",
        )}
      >
        <Check className="size-3.5" />
      </span>
      {children}
    </button>
  )
}
