import Link from "next/link"
import { AlertCircle, ArrowRight, BadgeCheck, MapPin, Wand2 } from "lucide-react"
import { EntityAvatar } from "@/components/ui/entity-avatar"
import { ROUTES } from "@/lib/config/routes"
import type { ProfileCompletion } from "@/lib/candidate-completion"
import type { CandidateProfile, UpdateCandidateProfileDto } from "@/lib/types/candidate.types"
import { cn } from "@/lib/utils"
import { ProgressRing } from "../progress-ring"
import { sectionForStep, type ProfileSectionId } from "./profile-sections.config"

const VISIBLE_PENDING = 4

export function ProfileSummaryCard({
  profile,
  form,
  completion,
  disabled,
  onGoTo,
}: {
  profile: CandidateProfile
  form: UpdateCandidateProfileDto
  completion: ProfileCompletion
  disabled: boolean
  onGoTo: (section: ProfileSectionId) => void
}) {
  const local = [form.city, form.state].filter(Boolean).join(", ")
  const pending = [...completion.missingRequired, ...completion.missing.filter((item) => !item.required)]

  return (
    <div className="overflow-hidden rounded-card border border-border bg-card shadow-card">
      <div className="flex items-center gap-3 p-5">
        {profile.profileImageUrl ? (
          <img src={profile.profileImageUrl} alt="Sua foto de perfil" className="size-14 shrink-0 rounded-full object-cover" />
        ) : (
          <EntityAvatar name={profile.userName} size="lg" className="rounded-full" />
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-foreground">{profile.userName || "Minha conta"}</p>
          <p className={cn("truncate text-xs", form.headline ? "text-primary" : "italic text-subtle-foreground")}>
            {form.headline || "Sem título profissional"}
          </p>
          {local && (
            <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground">
              <MapPin className="size-3 shrink-0" aria-hidden />
              {local}
            </p>
          )}
        </div>
      </div>

      <div className="border-t border-border px-5 py-4">
        <div className="flex items-center gap-4">
          <ProgressRing
            value={completion.value}
            size={56}
            stroke={5}
            tone={completion.ready ? "success" : "primary"}
            label="Preenchimento do perfil"
          />
          <div className="min-w-0">
            <p className={cn("flex items-center gap-1 text-sm font-bold", completion.ready ? "text-success-foreground" : "text-foreground")}>
              {completion.ready && <BadgeCheck className="size-4 text-success" aria-hidden />}
              {completion.complete ? "Perfil completo" : completion.ready ? "Pronto para se candidatar" : "Perfil incompleto"}
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
              {completion.ready
                ? completion.complete
                  ? "Todas as informações preenchidas."
                  : "Itens opcionais ajudam você a se destacar."
                : `${completion.missingRequired.length} ${completion.missingRequired.length === 1 ? "item obrigatório pendente" : "itens obrigatórios pendentes"}.`}
            </p>
          </div>
        </div>

        {pending.length > 0 && (
          <ul className="mt-4 flex flex-col" aria-label="Itens pendentes">
            {pending.slice(0, VISIBLE_PENDING).map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => onGoTo(sectionForStep(item.step))}
                  className="group -mx-2 flex min-h-10 w-[calc(100%+1rem)] items-center gap-2.5 rounded-lg px-2 text-left text-xs font-semibold text-strong-foreground transition-colors hover:bg-muted"
                >
                  <AlertCircle
                    className={cn("size-3.5 shrink-0", item.required ? "text-warning" : "text-subtle-foreground")}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  {!item.required && <span className="text-[11px] font-medium text-subtle-foreground">Opcional</span>}
                  <ArrowRight
                    className="size-3.5 shrink-0 text-subtle-foreground transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </button>
              </li>
            ))}
            {pending.length > VISIBLE_PENDING && (
              <li className="pt-1 text-xs text-subtle-foreground">
                +{pending.length - VISIBLE_PENDING} {pending.length - VISIBLE_PENDING === 1 ? "item" : "itens"}
              </li>
            )}
          </ul>
        )}

        {!completion.ready && (
          <Link href={ROUTES.candidate.completeProfile} className="btn-primary mt-4 w-full">
            <Wand2 className="size-4" aria-hidden />
            Completar com o passo a passo
          </Link>
        )}
      </div>
    </div>
  )
}
