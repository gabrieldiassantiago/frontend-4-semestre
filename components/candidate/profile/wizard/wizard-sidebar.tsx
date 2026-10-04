import { Lightbulb } from "lucide-react"
import type { ProfileCompletion, ProfileStepId } from "@/lib/candidate-completion"
import { ProfileStepTrail } from "../profile-step-trail"
import { ProgressRing } from "../progress-ring"

export function WizardSidebar({
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
  const missing = completion.missingRequired.length

  return (
    <aside className="hidden min-w-0 flex-col gap-6 md:sticky md:top-24 md:flex md:self-start">
      <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
        <ProgressRing
          value={completion.value}
          tone={completion.ready ? "success" : "primary"}
          label="Preenchimento do perfil"
        />
        <div className="min-w-0">
          <p className="text-sm font-bold text-foreground">Seu perfil</p>
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
            {missing === 0
              ? "Pronto para se candidatar."
              : `${missing} ${missing === 1 ? "item obrigatório" : "itens obrigatórios"} para se candidatar.`}
          </p>
        </div>
      </div>

      <ProfileStepTrail atual={atual} completion={completion} disabled={disabled} onSelect={onSelect} />

      <div className="flex gap-3 rounded-2xl bg-primary-subtle/60 p-4">
        <Lightbulb className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
        <p className="text-xs leading-relaxed text-primary-subtle-foreground">
          Não precisa ter todas as respostas agora. Seu progresso é salvo a cada etapa e você pode editar depois.
        </p>
      </div>
    </aside>
  )
}
