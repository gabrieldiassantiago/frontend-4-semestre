import Link from "next/link"
import { ArrowUpRight, MapPin, Wallet } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { CompanyLogo } from "@/components/shared/company-logo"
import { ROUTES } from "@/lib/config/routes"
import { formatCurrency } from "@/lib/format"
import { CATEGORIA_LABELS, MODALIDADE_LABELS, type Vaga } from "@/lib/types/vaga.types"

export function RecommendedJobCard({ vaga }: { vaga: Vaga }) {
  const company = vaga.nomeEmpresa || "Empresa"
  const location = [vaga.cidade, vaga.estado].filter(Boolean).join(" - ")

  return (
    <Link
      href={ROUTES.candidate.job(vaga.id)}
      className="group flex h-full min-w-0 flex-col rounded-xl border border-border/70 bg-card p-4 transition-[border-color,box-shadow] hover:border-primary/30 hover:shadow-raised"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <CompanyLogo name={company} url={vaga.logoUrlEmpresa} size="md" />
          <span className="truncate text-sm text-muted-foreground">{company}</span>
        </div>
        <ArrowUpRight
          aria-hidden
          className="size-4 shrink-0 text-subtle-foreground transition-colors group-hover:text-primary"
        />
      </div>

      <h3 className="mt-4 line-clamp-2 text-sm font-semibold leading-relaxed tracking-tight text-foreground transition-colors group-hover:text-primary">
        {vaga.titulo}
      </h3>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {vaga.modalidade && <Badge size="sm">{MODALIDADE_LABELS[vaga.modalidade]}</Badge>}
        {vaga.categoria && CATEGORIA_LABELS[vaga.categoria] && (
          <Badge size="sm" variant="outline">
            {CATEGORIA_LABELS[vaga.categoria]}
          </Badge>
        )}
      </div>

      <div aria-hidden className="min-h-5 flex-1" />
      <dl className="flex flex-col gap-2 border-t border-border-subtle pt-4 text-xs text-muted-foreground">
        {location && (
          <div className="flex items-center gap-2">
            <dt className="sr-only">Local</dt>
            <MapPin aria-hidden className="size-4 shrink-0 text-subtle-foreground" />
            <dd className="truncate">{location}</dd>
          </div>
        )}
        {(
          <div className="flex items-center gap-2">
            <dt className="sr-only">Salário</dt>
            <Wallet aria-hidden className="size-4 shrink-0 text-subtle-foreground" />
            <dd className="font-semibold text-strong-foreground">{vaga.salario > 0 ? `${formatCurrency(vaga.salario)} / mês` : "A combinar"}</dd>
          </div>
        )}
      </dl>
    </Link>
  )
}
