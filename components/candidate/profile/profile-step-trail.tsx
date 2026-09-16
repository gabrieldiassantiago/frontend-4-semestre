"use client"

import { Check } from "lucide-react"
import { motion } from "framer-motion"
import { PROFILE_STEPS, type ProfileCompletion, type ProfileStepId } from "@/lib/candidate-completion"
import { cn } from "@/lib/utils"

export function ProfileStepTrail({ atual, completion, disabled, onSelect }: {
  atual: ProfileStepId
  completion: ProfileCompletion
  disabled: boolean
  onSelect: (id: ProfileStepId) => void
}) {
  return (
    <nav aria-label="Etapas do perfil" className="-mx-5 mb-7 overflow-x-auto px-5 pb-2 md:mx-0 md:mb-0 md:overflow-visible md:px-0 md:pb-0">
      <ol className="flex w-max min-w-full gap-2 rounded-full border border-border bg-card/95 p-1.5 shadow-card md:w-full md:min-w-0 md:flex-col md:rounded-[28px] md:p-2">
        {PROFILE_STEPS.map((step, index) => {
          const items = completion.items.filter((item) => item.step === step.id)
          const done = items.length > 0 && items.every((item) => item.done)
          const active = atual === step.id

          return (
            <li key={step.id} className="shrink-0 md:w-full">
              <button
                type="button"
                disabled={disabled}
                onClick={() => onSelect(step.id)}
                aria-current={active ? "step" : undefined}
                aria-label={`Etapa ${index + 1}: ${step.label}${done ? ", preenchida" : ""}`}
                className={cn(
                  "relative flex h-12 min-w-[118px] items-center justify-center gap-2 overflow-hidden rounded-full px-4 text-sm font-semibold transition-colors md:w-full md:justify-start md:px-3",
                  active ? "text-primary-foreground md:text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="profile-step-active"
                    className="absolute inset-0 rounded-full bg-primary md:bg-primary-subtle"
                    transition={{ type: "spring", stiffness: 420, damping: 36 }}
                  />
                )}
                <span
                  className={cn(
                    "relative grid size-7 shrink-0 place-items-center rounded-full text-xs transition-colors",
                    active ? "bg-white/20 text-current md:bg-primary md:text-white" : "bg-muted text-subtle-foreground",
                  )}
                >
                  {done ? <Check size={15} aria-label="Preenchido" /> : String(index + 1).padStart(2, "0")}
                </span>
                <span className="relative max-w-28 truncate md:max-w-none">{step.label}</span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
