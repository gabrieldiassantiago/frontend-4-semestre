import Link from "next/link"
import { ArrowRight, CalendarDays } from "lucide-react"
import { CompanyLogo } from "@/components/shared/company-logo"
import { EtapaTrilha, StatusBadge } from "@/components/shared/candidatura/candidatura-ui"
import { ROUTES } from "@/lib/config/routes"
import { formatDate } from "@/lib/format"
import type { Candidatura } from "@/lib/types/candidatura.types"

export function ActiveApplicationCard({ candidatura }: { candidatura: Candidatura }) {
  const company = candidatura.nomeEmpresa ?? "Empresa"
  const href = ROUTES.candidate.application(candidatura.id)

  return (
    <article className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-2xs transition-shadow hover:shadow-card">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex min-w-0 items-start gap-4">
          <CompanyLogo name={company} url={candidatura.logoUrlEmpresa} size="lg" />
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={candidatura.status} size="sm" />
              {candidatura.createdAt && (
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <CalendarDays aria-hidden className="size-3.5" />
                  {formatDate(candidatura.createdAt)}
                </span>
              )}
            </div>

            <h3 className="truncate text-lg font-semibold tracking-tight text-foreground sm:text-xl">
              {candidatura.vagaTitulo}
            </h3>

            <p className="truncate text-sm text-muted-foreground">
              {company}
              <span className="mx-2 text-border-strong">•</span>
              <span className="text-foreground/80 font-medium">
                {candidatura.etapaAtualDescricao ?? candidatura.etapaAtual}
              </span>
            </p>
          </div>
        </div>

        <Link
          href={href}
          className="inline-flex h-10 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-primary/10 px-4 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground sm:w-auto"
        >
          Acompanhar
          <ArrowRight aria-hidden className="size-4" />
        </Link>
      </div>

      <div className="border-t border-border/60 bg-muted/25 px-5 py-4 overflow-x-auto sm:px-6">
        <EtapaTrilha
          etapa={candidatura.etapaAtual}
          status={candidatura.status}
          etapasVaga={candidatura.etapasVaga}
        />
      </div>
    </article>
  )
}
