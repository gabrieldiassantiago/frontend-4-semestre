import Link from "next/link"
import { ArrowRight, BadgeCheck, Circle, MapPin } from "lucide-react"
import { EntityAvatar } from "@/components/ui/entity-avatar"
import { ROUTES } from "@/lib/config/routes"
import type { ProfileCompletion } from "@/lib/candidate-completion"
import type { CandidateProfile, UpdateCandidateProfileDto } from "@/lib/types/candidate.types"
import { sectionForStep, type ProfileSectionId } from "./profile-sections.config"

export function ProfileSummaryCard({ profile, form, completion, disabled, onGoTo }: {
  profile: CandidateProfile
  form: UpdateCandidateProfileDto
  completion: ProfileCompletion
  disabled: boolean
  onGoTo: (section: ProfileSectionId) => void
}) {
  const local = [form.city, form.state].filter(Boolean).join(", ")
  const pending = [...completion.missingRequired, ...completion.missing.filter((item) => !item.required)]
  return (
    <section aria-label="Resumo do perfil" className="overflow-hidden rounded-2xl border border-border/80 bg-card">
      <div className="grid gap-5 p-5 sm:p-6 md:grid-cols-[minmax(0,1fr)_minmax(240px,0.65fr)] md:items-center md:gap-8">
        <div className="flex min-w-0 items-center gap-4">
          {profile.profileImageUrl ? (
            <img src={profile.profileImageUrl} alt="Sua foto de perfil" className="size-16 shrink-0 rounded-2xl object-cover ring-4 ring-primary-subtle" />
          ) : (
            <EntityAvatar name={profile.userName} size="lg" className="size-16 rounded-2xl ring-4 ring-primary-subtle" />
          )}
          <div className="min-w-0">
            <p className="text-base font-semibold tracking-tight text-foreground sm:text-lg">{profile.userName || "Minha conta"}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{form.headline || "Adicione seu título profissional"}</p>
            {local && <p className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="size-3.5 shrink-0" aria-hidden />{local}</p>}
          </div>
        </div>
        <div className="min-w-0 rounded-xl bg-primary-subtle/60 px-4 py-3.5">
          <div className="flex items-center justify-between gap-3">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-strong-foreground">
              {completion.ready && <BadgeCheck className="size-4 text-success" aria-hidden />}
              {completion.complete ? "Perfil completo" : "Preenchimento do perfil"}
            </p>
            <span className="text-sm font-semibold tabular-nums text-primary-subtle-foreground">{completion.value}%</span>
          </div>
          <div role="progressbar" aria-label="Preenchimento do perfil" aria-valuenow={completion.value} aria-valuemin={0} aria-valuemax={100} className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-primary/10">
            <div className="h-full rounded-full bg-primary transition-[width] duration-300 motion-reduce:transition-none" style={{ width: `${completion.value}%` }} />
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
            {completion.complete ? "Todas as informações preenchidas." : completion.ready ? "Pronto para se candidatar. Você ainda pode enriquecer seu perfil." : `${completion.missingRequired.length} ${completion.missingRequired.length === 1 ? "item obrigatório para completar" : "itens obrigatórios para completar"}.`}
          </p>
        </div>
      </div>
      {pending.length > 0 && (
        <details className="border-t border-border/60">
          <summary className="cursor-pointer px-5 py-3 text-xs font-medium text-primary-subtle-foreground transition-colors hover:bg-primary-subtle/30 sm:px-6">O que falta preencher <span className="ml-1 text-muted-foreground">({pending.length})</span></summary>
          <div className="px-5 pb-4 sm:px-6">
            <ul className="grid gap-x-6 sm:grid-cols-2" aria-label="Itens pendentes">
              {pending.map((item) => (
                <li key={item.id}>
                  <button type="button" disabled={disabled} onClick={() => onGoTo(sectionForStep(item.step))} className="flex min-h-11 w-full items-center gap-2 rounded-lg px-2 text-left text-xs text-strong-foreground transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50">
                    <Circle aria-hidden className="size-3 shrink-0 text-muted-foreground" />
                    <span className="min-w-0 flex-1">{item.label}</span>
                    <span className="text-[10px] text-muted-foreground">{item.required ? "Obrigatório" : "Opcional"}</span>
                    <ArrowRight aria-hidden className="size-3.5 shrink-0 text-primary" />
                  </button>
                </li>
              ))}
            </ul>
            {!completion.ready && <Link href={ROUTES.candidate.completeProfile} className="mt-2 inline-flex min-h-11 items-center gap-2 text-xs font-semibold text-primary">Preencher com o passo a passo<ArrowRight aria-hidden className="size-3.5" /></Link>}
          </div>
        </details>
      )}
    </section>
  )
}
