"use client"

import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { useFlow } from "./flow-context"
import { stepSummary } from "./steps"
import type { VagaDraft } from "./types"

/**
 * Trilha vertical de etapas. Só navega para etapas já visitadas, para que a
 * trilha não vire atalho para pular validações.
 */
export function StepRail({
  current,
  maxReached,
  draft,
  onSelect,
}: {
  current: number
  maxReached: number
  draft: VagaDraft
  onSelect: (index: number) => void
}) {
  const { steps, mode } = useFlow()

  return (
    <nav aria-label={mode === "edit" ? "Seções da vaga" : "Etapas da publicação"}>
      <ol className="relative">
        {steps.map((step, index) => {
          const active = index === current
          const done = index < current || (index <= maxReached && index !== current)
          const reachable = index <= maxReached
          const summary = reachable && !active ? stepSummary(step.id, draft) : null
          const Icon = step.icon
          const isLast = index === steps.length - 1

          return (
            <li key={step.id} className="relative pb-1">
              {!isLast && (
                <span
                  aria-hidden
                  className="absolute left-[19.5px] top-[38px] h-[calc(100%-36px)] w-px bg-border"
                >
                  <span
                    className={cn(
                      "block w-full bg-primary transition-all duration-500 ease-out",
                      index < current ? "h-full" : "h-0",
                    )}
                  />
                </span>
              )}

              <button
                type="button"
                disabled={!reachable}
                aria-current={active ? "step" : undefined}
                onClick={() => onSelect(index)}
                className={cn(
                  "flex w-full items-start gap-3 rounded-xl p-1.5 text-left transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  reachable && !active && "hover:bg-muted",
                  !reachable && "cursor-not-allowed",
                )}
              >
                <span
                  className={cn(
                    "relative grid size-7 shrink-0 place-items-center rounded-full border text-xs transition-all duration-300",
                    active && "border-primary bg-primary text-primary-foreground shadow-[0_0_0_4px_var(--primary-ring)]",
                    !active && done && "border-primary bg-primary-subtle text-primary",
                    !active && !done && "border-border bg-card text-subtle-foreground",
                  )}
                >
                  {!active && done ? (
                    <Check className="size-3.5" aria-hidden />
                  ) : (
                    <Icon className="size-3.5" aria-hidden />
                  )}
                </span>
                <span className="min-w-0 pt-0.5">
                  <span
                    className={cn(
                      "block text-sm font-semibold transition-colors",
                      active ? "text-foreground" : reachable ? "text-strong-foreground" : "text-subtle-foreground",
                    )}
                  >
                    {step.label}
                  </span>
                  {summary && (
                    <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                      {summary}
                    </span>
                  )}
                </span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
