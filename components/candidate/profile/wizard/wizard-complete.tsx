import Link from "next/link"
import {
  AlertCircle,
  ArrowRight,
  Check,
  CircleUserRound,
} from "lucide-react"

import { PageShell } from "@/components/ui/page"
import { SuccessLottie } from "@/components/ui/success-lottie"
import { ROUTES } from "@/lib/config/routes"
import type { ProfileCompletion } from "@/lib/candidate-completion"
import { ProgressRing } from "../progress-ring"

export function WizardComplete({
  completion,
}: {
  completion: ProfileCompletion
}) {
  const missing = completion.missingRequired

  return (
    <PageShell className="max-w-2xl py-10 sm:py-16">
      <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-card">
        <div
          className={`h-1.5 w-full ${
            completion.ready ? "bg-success" : "bg-primary"
          }`}
        />

        <div className="px-6 py-8 text-center sm:px-10 sm:py-10">
          {completion.ready ? (
            <SuccessLottie />
          ) : (
            <div className="mx-auto mb-5 grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
              <CircleUserRound className="size-6" aria-hidden />
            </div>
          )}

          <p
            className={`mb-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
              completion.ready
                ? "bg-success/10 text-success"
                : "bg-primary/10 text-primary"
            }`}
          >
            {completion.ready ? (
              <>
                <Check className="size-3.5" aria-hidden />
                Perfil completo
              </>
            ) : (
              "Progresso salvo"
            )}
          </p>

          <h1 className="text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {completion.ready
              ? "Seu perfil está pronto"
              : "Seu perfil foi salvo"}
          </h1>

          <p className="mx-auto mt-3 max-w-md text-pretty text-sm leading-relaxed text-muted-foreground">
            {completion.ready
              ? "Suas informações serão exibidas às empresas quando você se candidatar."
              : "Você pode voltar quando quiser. Complete os itens pendentes para liberar suas candidaturas."}
          </p>

          <div className="mx-auto mt-8 flex max-w-sm items-center gap-5 rounded-2xl border border-border bg-background/60 p-4 text-left">
            <ProgressRing
              value={completion.value}
              size={76}
              stroke={7}
              tone={completion.ready ? "success" : "primary"}
              label="Preenchimento do perfil"
            />

            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">
                {completion.value}% preenchido
              </p>

              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {completion.ready
                  ? "Tudo certo para começar."
                  : missing.length === 1
                    ? "Falta 1 informação obrigatória."
                    : `Faltam ${missing.length} informações obrigatórias.`}
              </p>
            </div>
          </div>

          {missing.length > 0 && (
            <div className="mt-7 text-left">
              <h2 className="mb-3 text-sm font-semibold text-foreground">
                Para se candidatar, complete:
              </h2>

              <ul className="divide-y divide-border-subtle overflow-hidden rounded-2xl border border-border">
                {missing.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center gap-3 bg-card px-4 py-3.5 text-sm text-strong-foreground"
                  >
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-warning/10 text-warning">
                      <AlertCircle className="size-4" aria-hidden />
                    </span>

                    <span>{item.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={
                completion.ready
                  ? ROUTES.candidate.overview
                  : ROUTES.candidate.profile
              }
              className="btn-primary flex min-h-11 flex-1 items-center justify-center gap-2"
            >
              {completion.ready ? "Ver vagas" : "Completar perfil"}
              <ArrowRight className="size-4" aria-hidden />
            </Link>

            <Link
              href={
                completion.ready
                  ? ROUTES.candidate.profile
                  : ROUTES.candidate.overview
              }
              className="btn-secondary flex min-h-11 flex-1 items-center justify-center"
            >
              {completion.ready ? "Ir para meu perfil" : "Ver vagas"}
            </Link>
          </div>

          {!completion.ready && (
            <p className="mt-4 text-xs text-muted-foreground">
              Seu progresso fica salvo — você não precisa preencher tudo agora.
            </p>
          )}
        </div>
      </div>
    </PageShell>
  )
}''