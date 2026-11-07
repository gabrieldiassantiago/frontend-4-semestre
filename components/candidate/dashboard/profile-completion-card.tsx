import Link from "next/link"
import { ArrowRight, CheckCircle2, Circle, UserRound } from "lucide-react"
import { ROUTES } from "@/lib/config/routes"
import type { ProfileCompletion } from "@/lib/candidate-completion"
import { EntityAvatar } from "@/components/ui/entity-avatar"
import { ProgressRing } from "@/components/candidate/profile/progress-ring"
import { OverviewGreeting } from "./overview-greeting"

export function ProfileCompletionCard({ completion, firstName, imageUrl }: {
  completion: ProfileCompletion
  firstName?: string
  imageUrl?: string | null
}) {
  const { value, missing, complete } = completion
  return (
    <section aria-labelledby="profile-completion-title" className="rounded-2xl border border-border/60 bg-card p-5">
      <div className="flex items-center justify-between">
        <h2 id="profile-completion-title" className="text-sm font-semibold tracking-tight">Seu perfil</h2>
        <Link href={ROUTES.candidate.profile} aria-label="Editar meu perfil" className="grid size-9 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-primary-subtle hover:text-primary"><UserRound aria-hidden className="size-4" /></Link>
      </div>
      <div className="relative mx-auto mt-4 w-fit">
        <ProgressRing value={value} size={112} stroke={4} label="Preenchimento do perfil" className="[&>span]:hidden" />
        <div className="absolute inset-0 grid place-items-center">
          {imageUrl ? <img src={imageUrl} alt="Sua foto de perfil" className="size-20 rounded-full object-cover" /> : <EntityAvatar name={firstName || "Candidato"} size="lg" className="size-20 rounded-full text-xl" />}
        </div>
        <span className="absolute -right-1 top-1 rounded-full bg-primary px-2 py-1 text-[10px] font-semibold text-white ring-4 ring-card">{value}%</span>
      </div>
      <p className="mt-4 text-center text-base font-semibold tracking-tight"><OverviewGreeting firstName={firstName} /></p>
      <p className="mt-1 text-center text-xs leading-relaxed text-muted-foreground">{complete ? "Tudo pronto para sua próxima oportunidade." : "Cada detalhe conta a sua história."}</p>
      <div className="mt-5 rounded-xl bg-primary-subtle/50 p-4">
        <p className="text-xs font-semibold text-strong-foreground">{complete ? "Perfil completo" : "Seus próximos passos"}</p>
        {complete ? <p className="mt-3 flex items-center gap-2 text-xs text-success-foreground"><CheckCircle2 aria-hidden className="size-4" />Todas as informações preenchidas</p> : (
          <ul className="mt-3 space-y-3">
            {missing.slice(0, 3).map((item) => <li key={item.id} className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground"><Circle aria-hidden className="mt-0.5 size-3 shrink-0 text-primary/60" /><span>{item.label}</span></li>)}
            {missing.length > 3 && <li className="text-[11px] text-muted-foreground">+{missing.length - 3} itens para enriquecer seu perfil</li>}
          </ul>
        )}
        <Link href={ROUTES.candidate.profile} className="mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg bg-card px-3 text-xs font-semibold text-primary transition-colors hover:bg-primary-subtle">{complete ? "Ver meu perfil" : "Atualizar meu perfil"}<ArrowRight aria-hidden className="size-3.5" /></Link>
      </div>
    </section>
  )
}
