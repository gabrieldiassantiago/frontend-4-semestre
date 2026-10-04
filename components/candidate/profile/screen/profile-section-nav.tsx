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

function StateMark({ state }: { state: SectionState }) {
  if (state === "done") return <Check className="size-4 shrink-0 text-success" strokeWidth={2.5} aria-hidden />
  if (state === "pending-required") return <span className="size-2 shrink-0 rounded-full bg-warning" aria-hidden />
  if (state === "pending-optional") return <span className="size-2 shrink-0 rounded-full border border-border-strong" aria-hidden />
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
      <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] xl:mx-0 xl:flex-col xl:gap-0.5 xl:overflow-visible xl:rounded-card xl:border xl:border-border xl:bg-card xl:p-2 xl:pb-2">
        {PROFILE_SECTIONS.map((item) => {
          const current = active === item.id
          const state = sectionState(completion, item.steps)

          return (
            <li key={item.id} className={cn("shrink-0", item.id === "preview" && "xl:mt-1.5 xl:border-t xl:border-border-subtle xl:pt-1.5")}>
              <button
                type="button"
                disabled={disabled}
                onClick={() => onSelect(item.id)}
                aria-current={current ? "page" : undefined}
                aria-label={item.label + STATE_LABEL[state]}
                className={cn(
                  "flex min-h-11 items-center gap-2.5 whitespace-nowrap rounded-full border px-4 text-sm font-semibold transition-colors xl:w-full xl:rounded-lg xl:border-transparent xl:px-3",
                  current
                    ? "border-primary bg-primary-subtle text-primary-subtle-foreground xl:border-transparent"
                    : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground xl:bg-transparent",
                )}
              >
                <item.icon className="size-[18px] shrink-0" aria-hidden />
                <span className="flex-1 text-left">{item.label}</span>
                <StateMark state={state} />
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
