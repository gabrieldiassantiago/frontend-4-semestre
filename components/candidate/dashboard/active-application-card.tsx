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
    <article className="overflow-hidden rounded-[28px] border border-border/60 bg-card">
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
          className="inline-flex min-h-11 w-full shrink-0 items-center justify-between gap-3 rounded-full bg-primary py-1.5 pl-5 pr-1.5 text-sm font-medium text-white transition-colors hover:bg-primary-hover sm:w-auto"
        >
          Acompanhar
          <span className="grid size-8 place-items-center rounded-full bg-white text-primary">
            <ArrowRight aria-hidden className="size-4" />
          </span>
        </Link>
      </div>

      <div className="mx-2 mb-2 overflow-x-auto rounded-[20px] bg-surface px-4 py-4 sm:px-5">
        <EtapaTrilha
          etapa={candidatura.etapaAtual}
          status={candidatura.status}
          etapasVaga={candidatura.etapasVaga}
        />
      </div>
    </article>
  )
}
