import { Check } from "lucide-react"
import type { ProfileCompletion, ProfileStepId } from "@/lib/candidate-completion"
import { cn } from "@/lib/utils"
import { PROFILE_SECTIONS, type ProfileSectionId } from "./profile-sections.config"

type SectionState = "done" | "pending-required" | "pending-optional" | "none"

function sectionState(completion: ProfileCompletion, steps: readonly ProfileStepId[]): SectionState {
  const items = completion.items.filter((item) => steps.includes(item.step))
  if (items.length === 0) return "none"
  if (items.some((item) => item.required && !item.done)) return "pending-required"
  if (items.some((item) => !item.done)) return "pending-optional"
  return "done"
}

const STATE_LABEL: Record<SectionState, string> = {
  done: ", completa",
  "pending-required": ", tem item obrigatório pendente",
  "pending-optional": ", tem item opcional pendente",
  none: "",
}

function StateMark({ state, current }: { state: SectionState; current: boolean }) {
  if (state === "done") return <Check className={cn("size-4 shrink-0", current ? "text-white" : "text-mint-strong")} strokeWidth={2.5} aria-hidden />
  if (state === "pending-required") return <span className={cn("size-2 shrink-0 rounded-full", current ? "bg-white" : "bg-primary")} aria-hidden />
  if (state === "pending-optional") return <span className={cn("size-2 shrink-0 rounded-full border", current ? "border-white/70" : "border-border-strong")} aria-hidden />
  return null
}

export function ProfileSectionNav({
  active,
  completion,
  disabled,
  onSelect,
}: {
  active: ProfileSectionId
  completion: ProfileCompletion
  disabled: boolean
  onSelect: (section: ProfileSectionId) => void
}) {
  return (
    <nav aria-label="Seções do perfil">
      <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] lg:mx-0 lg:flex-col lg:gap-1 lg:overflow-visible lg:rounded-[28px] lg:border lg:border-border/60 lg:bg-card lg:p-3">
        <li aria-hidden className="hidden px-3 pb-1.5 pt-1 text-xs text-muted-foreground lg:block">Editar perfil</li>
        {PROFILE_SECTIONS.map((item) => {
          const current = active === item.id
          const state = sectionState(completion, item.steps)

          return (
            <li key={item.id} className={cn("shrink-0", item.id === "preview" && "lg:mt-2 lg:border-t lg:border-border/60 lg:pt-3")}>
              <button
                type="button"
                disabled={disabled}
                onClick={() => onSelect(item.id)}
                aria-current={current ? "page" : undefined}
                aria-label={item.label + STATE_LABEL[state]}
                className={cn(
                  "group flex min-h-11 items-center gap-2.5 whitespace-nowrap rounded-full border py-1 pl-1 pr-3.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 lg:w-full lg:border-transparent",
                  current
                    ? "border-transparent bg-primary text-white"
                    : "border-border bg-card text-strong-foreground hover:bg-primary-subtle hover:text-primary lg:bg-transparent",
                )}
              >
                <span className={cn("grid size-9 shrink-0 place-items-center rounded-full transition-colors", current ? "bg-white text-primary" : "bg-surface group-hover:bg-card")}>
                  <item.icon className="size-[18px]" aria-hidden />
                </span>
                <span className="flex-1 text-left">{item.label}</span>
                <StateMark state={state} current={current} />
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
