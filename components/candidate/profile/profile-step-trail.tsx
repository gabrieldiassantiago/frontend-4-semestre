"use client"

import { Check } from "lucide-react"
import {
  PROFILE_STEPS,
  getStepStatus,
  type ProfileCompletion,
  type ProfileStepId,
} from "@/lib/candidate-completion"
import { cn } from "@/lib/utils"

const GROUPS: { title: string; steps: ProfileStepId[] }[] = [
  { title: "Essencial", steps: ["basico", "localizacao", "formacao", "skills"] },
  { title: "Destaque seu perfil", steps: ["links", "curriculo", "experiencias", "projetos"] },
  { title: "Finalizar", steps: ["revisao"] },
]

export function ProfileStepTrail({
  atual,
  completion,
  disabled,
  onSelect,
}: {
  atual: ProfileStepId
  completion: ProfileCompletion
  disabled: boolean
  onSelect: (id: ProfileStepId) => void
}) {
  return (
    <nav aria-label="Etapas do perfil" className="flex flex-col gap-5">
      {GROUPS.map((group) => (
        <div key={group.title}>
          <p className="px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-subtle-foreground">
            {group.title}
          </p>
          <ol className="mt-2 flex flex-col">
            {group.steps.map((id) => {
              const index = PROFILE_STEPS.findIndex((step) => step.id === id)
              const step = PROFILE_STEPS[index]
              const status = getStepStatus(completion, id)
              const active = atual === id

              return (
                <li key={id}>
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => onSelect(id)}
                    aria-current={active ? "step" : undefined}
                    aria-label={`Etapa ${index + 1}: ${step.label}${status.done ? ", concluída" : status.optional ? ", opcional" : ""}`}
                    className={cn(
                      "group flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-semibold transition-colors",
                      active
                        ? "bg-primary-subtle text-primary-subtle-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "grid size-6 shrink-0 place-items-center rounded-full text-[11px] font-bold tabular-nums transition-colors",
                        status.done
                          ? "bg-success text-white"
                          : active
                            ? "bg-primary text-primary-foreground"
                            : "border border-border-strong bg-card text-subtle-foreground",
                      )}
                    >
                      {status.done ? <Check className="size-3.5" strokeWidth={3} /> : index + 1}
                    </span>
                    <span className="min-w-0 flex-1 truncate">{step.label}</span>
                    {status.optional && !status.done && (
                      <span className="shrink-0 text-[11px] font-medium text-subtle-foreground">Opcional</span>
                    )}
                  </button>
                </li>
              )
            })}
          </ol>
        </div>
      ))}
    </nav>
  )
}
