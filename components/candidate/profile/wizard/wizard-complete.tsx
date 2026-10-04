import Link from "next/link"
import { AlertCircle, ArrowRight, PartyPopper } from "lucide-react"
import { PageShell } from "@/components/ui/page"
import { ROUTES } from "@/lib/config/routes"
import type { ProfileCompletion } from "@/lib/candidate-completion"
import { ProgressRing } from "../progress-ring"

export function WizardComplete({ completion }: { completion: ProfileCompletion }) {
  const missing = completion.missingRequired

  return (
    <PageShell className="max-w-lg py-16">
      <div className="flex flex-col items-center rounded-card border border-border bg-card px-6 py-10 text-center shadow-card sm:px-10">
        <div className="relative">
          <ProgressRing
            value={completion.value}
            size={96}
            stroke={8}
            tone={completion.ready ? "success" : "primary"}
            label="Preenchimento do perfil"
          />
          {completion.ready && (
            <span className="absolute -right-1 -top-1 grid size-9 place-items-center rounded-full border-4 border-card bg-success text-white">
              <PartyPopper className="size-4" aria-hidden />
            </span>
          )}
        </div>

        <h1 className="mt-6 text-2xl font-bold tracking-tight text-foreground text-balance">
          {completion.ready ? "Perfil pronto para se candidatar" : "Perfil salvo"}
        </h1>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground text-pretty">
          {completion.ready
            ? "Suas informações já aparecem para as empresas quando você se candidata."
            : "Seu progresso está salvo. Complete os itens abaixo para se candidatar às vagas."}
        </p>

        {missing.length > 0 && (
          <ul className="mt-6 w-full rounded-xl border border-border text-left">
            {missing.map((item) => (
              <li key={item.id} className="flex items-center gap-3 border-b border-border-subtle px-4 py-3 text-sm text-strong-foreground last:border-b-0">
                <AlertCircle className="size-4 shrink-0 text-warning" aria-hidden />
                {item.label}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-8 flex w-full flex-col gap-2 sm:flex-row">
          <Link href={ROUTES.candidate.overview} className="btn-primary flex-1">
            Ver vagas
            <ArrowRight className="size-4" aria-hidden />
          </Link>
          <Link href={ROUTES.candidate.profile} className="btn-secondary flex-1">
            Ir para meu perfil
          </Link>
        </div>
      </div>
    </PageShell>
  )
}
