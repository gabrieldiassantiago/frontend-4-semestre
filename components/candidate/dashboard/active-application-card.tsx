import Link from "next/link"
import { ArrowRight, CalendarDays } from "lucide-react"
import { CompanyLogo } from "@/components/shared/company-logo"
import { EtapaTrilha, StatusBadge } from "@/components/shared/candidatura/candidatura-ui"
import { ROUTES } from "@/lib/config/routes"
import { formatDate } from "@/lib/format"
import type { Candidatura } from "@/lib/types/candidatura.types"

/** Destaque do processo seletivo mais recente, com a trilha de etapas. */
export function ActiveApplicationCard({ candidatura }: { candidatura: Candidatura }) {
  const company = candidatura.nomeEmpresa ?? "Empresa"
  const href = ROUTES.candidate.application(candidatura.id)

  return (
    <article className="overflow-hidden rounded-card border border-border bg-card">
      <div className="flex flex-col gap-5 border-b border-border p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
        <div className="flex min-w-0 items-start gap-4">
          <CompanyLogo name={company} size="lg" />
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Processo em destaque</p>
            <h3 className="mt-1 text-lg font-semibold tracking-tight text-foreground text-pretty sm:text-xl">
              {candidatura.vagaTitulo}
            </h3>
            <p className="mt-0.5 text-sm text-muted-foreground">{company}</p>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
              <StatusBadge status={candidatura.status} size="sm" />
              {candidatura.createdAt && (
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays aria-hidden className="size-3.5" />
                  Inscrição em {formatDate(candidatura.createdAt)}
                </span>
              )}
              <span>
                <span className="font-semibold text-strong-foreground">Etapa atual:</span>{" "}
                {candidatura.etapaAtualDescricao ?? candidatura.etapaAtual}
              </span>
            </div>
          </div>
        </div>
        <Link href={href} className="btn-primary w-full sm:w-auto">
          Acompanhar processo
          <ArrowRight aria-hidden className="size-4" />
        </Link>
      </div>
      <div className="overflow-x-auto p-5 sm:p-6">
        <EtapaTrilha etapa={candidatura.etapaAtual} status={candidatura.status} etapasVaga={candidatura.etapasVaga} />
      </div>
    </article>
  )
}
