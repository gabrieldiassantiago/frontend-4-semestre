import Link from "next/link"
import { ArrowUpRight, CheckCircle2, Circle, UserRound } from "lucide-react"
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
    <section aria-labelledby="profile-completion-title" className="rounded-[28px] border border-border/60 bg-card p-2">
      <div className="px-4 pb-5 pt-4">
        <div className="flex items-center justify-between">
          <h2 id="profile-completion-title" className="text-sm font-semibold tracking-tight">Seu perfil</h2>
          <Link
            href={ROUTES.candidate.profile}
            aria-label="Editar meu perfil"
            className="grid size-9 place-items-center rounded-full border border-border text-strong-foreground transition-colors hover:border-primary hover:bg-primary hover:text-white"
          >
            <UserRound aria-hidden strokeWidth={1.75} className="size-4" />
          </Link>
        </div>
        <div className="relative mx-auto mt-4 w-fit">
          <ProgressRing value={value} size={112} stroke={4} label="Preenchimento do perfil" className="[&>span]:hidden" />
          <div className="absolute inset-0 grid place-items-center">
            {imageUrl ? <img src={imageUrl} alt="Sua foto de perfil" className="size-20 rounded-full object-cover" /> : <EntityAvatar name={firstName || "Candidato"} size="lg" className="size-20 rounded-full text-xl" />}
          </div>
          <span className="absolute -right-1 top-1 rounded-full bg-primary px-2 py-1 text-[10px] font-semibold tabular-nums text-white ring-4 ring-card">{value}%</span>
        </div>
        <p className="mt-4 text-center text-base font-semibold tracking-tight"><OverviewGreeting firstName={firstName} /></p>
        <p className="mt-1 text-center text-xs leading-relaxed text-muted-foreground">{complete ? "Tudo pronto para sua próxima oportunidade." : "Cada detalhe conta a sua história."}</p>
      </div>

      <div className="rounded-[20px] bg-primary-subtle p-4">
        <p className="text-xs font-semibold text-strong-foreground">{complete ? "Perfil completo" : "Seus próximos passos"}</p>
        {complete ? <p className="mt-3 flex items-center gap-2 text-xs text-primary"><CheckCircle2 aria-hidden className="size-4" />Todas as informações preenchidas</p> : (
          <ul className="mt-3 space-y-2.5">
            {missing.slice(0, 3).map((item) => <li key={item.id} className="flex items-start gap-2 text-xs leading-relaxed text-strong-foreground"><Circle aria-hidden className="mt-0.5 size-3 shrink-0 text-primary" /><span>{item.label}</span></li>)}
            {missing.length > 3 && <li className="text-[11px] text-strong-foreground/80">+{missing.length - 3} itens para enriquecer seu perfil</li>}
          </ul>
        )}
        <Link
          href={ROUTES.candidate.profile}
          className="group mt-4 flex min-h-12 w-full items-center justify-between gap-2 rounded-2xl bg-card py-1.5 pl-4 pr-1.5 text-xs font-semibold text-strong-foreground"
        >
          {complete ? "Ver meu perfil" : "Atualizar meu perfil"}
          <span className="grid size-9 place-items-center rounded-xl bg-primary-subtle text-primary transition-colors group-hover:bg-primary group-hover:text-white">
            <ArrowUpRight aria-hidden className="size-4" />
          </span>
        </Link>
      </div>
    </section>
  )
}
