"use client"

import { Fragment } from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { useFlow } from "./flow-context"
import { stepSummary } from "./steps"
import type { VagaDraft } from "./types"

/**
 * Stepper horizontal do cabeçalho. Fica fora da área de conteúdo para não
 * competir com o menu lateral do app. Só navega para etapas já visitadas,
 * para não virar atalho que pula validações.
 */
export function StepTrack({
  current,
  maxReached,
  draft,
  onSelect,
  className,
}: {
  current: number
  maxReached: number
  draft: VagaDraft
  onSelect: (index: number) => void
  className?: string
}) {
  const { steps, mode } = useFlow()

  return (
    <nav aria-label={mode === "edit" ? "Seções da vaga" : "Etapas da publicação"} className={className}>
      <ol className="flex items-center gap-1">
        {steps.map((step, index) => {
          const active = index === current
          const done = !active && index <= maxReached && (mode === "edit" || index < maxReached || index < current)
          const reachable = index <= maxReached
          const summary = reachable ? stepSummary(step.id, draft) : null

          return (
            <Fragment key={step.id}>
              {index > 0 && (
                <li aria-hidden className="h-px min-w-2 flex-1 overflow-hidden rounded-full bg-border">
                  <span
                    className={cn(
                      "block h-full bg-primary transition-[width] duration-500 ease-out",
                      index <= current || (mode === "edit" && index <= maxReached) ? "w-full" : "w-0",
                    )}
                  />
                </li>
              )}
              <li className="shrink-0">
                <button
                  type="button"
                  disabled={!reachable}
                  aria-current={active ? "step" : undefined}
                  title={summary ? `${step.label}: ${summary}` : step.label}
                  onClick={() => onSelect(index)}
                  className={cn(
                    "group relative flex items-center gap-2 rounded-full p-1 text-xs font-semibold transition-colors xl:pr-3",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    active && "bg-primary-subtle pr-3 text-primary-subtle-foreground",
                    !active && reachable && "text-strong-foreground hover:bg-muted",
                    !reachable && "cursor-not-allowed text-subtle-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "grid size-6 shrink-0 place-items-center rounded-full text-[11px] tabular-nums transition-colors duration-300",
                      active && "bg-primary text-primary-foreground",
                      done && "bg-primary-subtle text-primary",
                      !active && !done && "border border-border bg-card text-subtle-foreground",
                    )}
                  >
                    {done ? <Check className="size-3.5" strokeWidth={2.5} aria-hidden /> : index + 1}
                  </span>
                  <span className={cn("whitespace-nowrap", !active && "sr-only xl:not-sr-only")}>{step.label}</span>
                </button>
              </li>
            </Fragment>
          )
        })}
      </ol>
    </nav>
  )
}
