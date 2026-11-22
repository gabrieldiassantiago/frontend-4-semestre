import Link from "next/link"
import { ArrowRight, ArrowUpRight, BadgeCheck, ChevronDown, MapPin } from "lucide-react"
import { EntityAvatar } from "@/components/ui/entity-avatar"
import { ProgressRing } from "@/components/ui/progress-ring"
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
  const required = completion.missingRequired.length
  const groups = [
    { label: "Obrigatórios", items: completion.items.filter((item) => item.required) },
    { label: "Opcionais", items: completion.items.filter((item) => !item.required) },
  ]
    .filter((group) => group.items.length > 0)
    .map((group) => ({ ...group, total: group.items.length, done: group.items.filter((item) => item.done).length }))
  const status = completion.complete
    ? "Todas as informações preenchidas."
    : completion.ready
      ? "Pronto para se candidatar. Você ainda pode enriquecer seu perfil."
      : `${required} ${required === 1 ? "item obrigatório para completar" : "itens obrigatórios para completar"}.`

  return (
    <section aria-label="Resumo do perfil" className="overflow-hidden rounded-[28px] border border-border/60 bg-card">
      <div className="grid gap-4 p-3 md:grid-cols-[minmax(0,1fr)_minmax(280px,0.7fr)] md:items-stretch">
        <div className="flex min-w-0 items-center gap-4 px-2 py-3 sm:gap-5 sm:px-4">
          {/* O anel em volta da foto é o indicador de preenchimento desta tela. */}
          <div className="shrink-0">
            <span className="sr-only">{`Perfil ${completion.value}% preenchido`}</span>
            <ProgressRing value={completion.value} size={96} strokeWidth={4}>
              {profile.profileImageUrl ? (
                <img src={profile.profileImageUrl} alt="" className="size-20 rounded-full object-cover" />
              ) : (
                <EntityAvatar name={profile.userName} size="lg" className="size-20 rounded-full" />
              )}
            </ProgressRing>
          </div>
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              <span className="truncate">{profile.userName || "Minha conta"}</span>
              {completion.ready && <BadgeCheck className="size-5 shrink-0 text-primary" aria-label="Pronto para se candidatar" />}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-strong-foreground text-pretty">{form.headline || "Adicione seu título profissional"}</p>
            {local && (
              <p className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs text-strong-foreground">
                <MapPin className="size-3.5 shrink-0 text-primary" aria-hidden />
                {local}
              </p>
            )}
          </div>
        </div>

        <div className="flex min-w-0 flex-col justify-center gap-3 rounded-[20px] bg-surface p-4 sm:p-5">
          <div className="grid grid-cols-2 gap-3">
            {groups.map((group) => (
              <div key={group.label} className="min-w-0">
                <p className="text-xs text-muted-foreground">{group.label}</p>
                <p className="mt-1 text-2xl font-semibold leading-none tracking-tight tabular-nums text-foreground">
                  {group.done}
                  <span className="text-base font-medium text-muted-foreground">/{group.total}</span>
                </p>
                <div className="mt-2.5 flex flex-wrap gap-1" aria-hidden>
                  {group.items.map((item) => (
                    <span key={item.id} title={item.label} className={item.done ? "size-2 rounded-full bg-primary" : "size-2 rounded-full bg-border-strong"} />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs leading-relaxed text-strong-foreground">{status}</p>
        </div>
      </div>

      {pending.length > 0 && (
        <details className="group border-t border-border/60">
          <summary className="flex min-h-12 cursor-pointer list-none items-center gap-2 px-5 text-sm font-medium text-foreground transition-colors hover:bg-surface sm:px-7 [&::-webkit-details-marker]:hidden">
            O que falta preencher
            <span className="rounded-full bg-primary-subtle px-2 py-0.5 text-xs font-semibold tabular-nums text-primary">{pending.length}</span>
            <ChevronDown aria-hidden className="ml-auto size-4 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
          </summary>
          <div className="px-3 pb-3 sm:px-5 sm:pb-5">
            <ul className="grid gap-2 sm:grid-cols-2" aria-label="Itens pendentes">
              {pending.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => onGoTo(sectionForStep(item.step))}
                    className="group/item flex min-h-12 w-full items-center gap-3 rounded-2xl border border-border/60 py-1.5 pl-4 pr-1.5 text-left text-sm text-foreground transition-colors hover:border-primary/40 hover:bg-primary-subtle disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span className="min-w-0 flex-1 truncate">{item.label}</span>
                    <span className={item.required ? "rounded-full bg-primary-subtle px-2 py-0.5 text-[11px] font-semibold text-primary group-hover/item:bg-card" : "text-[11px] text-muted-foreground"}>
                      {item.required ? "Obrigatório" : "Opcional"}
                    </span>
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary-subtle text-primary transition-colors group-hover/item:bg-primary group-hover/item:text-white">
                      <ArrowUpRight aria-hidden className="size-4" />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            {!completion.ready && (
              <Link href={ROUTES.candidate.completeProfile} className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-semibold text-primary transition-colors hover:bg-primary-subtle">
                Preencher com o passo a passo
                <ArrowRight aria-hidden className="size-4" />
              </Link>
            )}
          </div>
        </details>
      )}
    </section>
  )
}
