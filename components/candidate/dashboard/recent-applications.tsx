import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { CompanyLogo } from "@/components/shared/company-logo"
import { StatusBadge } from "@/components/shared/candidatura/candidatura-ui"
import { ROUTES } from "@/lib/config/routes"
import { formatDate } from "@/lib/format"
import type { Candidatura } from "@/lib/types/candidatura.types"

export function RecentApplications({ candidaturas }: { candidaturas: Candidatura[] }) {
  if (candidaturas.length === 0) return null

  return (
    <ul className="divide-y divide-border-subtle overflow-hidden rounded-3xl border border-border/60 bg-card">
      {candidaturas.map((candidatura) => {
        const company = candidatura.nomeEmpresa ?? "Empresa"
        return (
          <li key={candidatura.id}>
            <Link
              href={ROUTES.candidate.application(candidatura.id)}
              className="group flex items-center gap-3 px-4 py-4 transition-colors hover:bg-muted focus-visible:bg-primary-subtle sm:gap-4 sm:px-5"
            >
              <CompanyLogo name={company} url={candidatura.logoUrlEmpresa} size="sm" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-foreground">
                  {candidatura.vagaTitulo}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {company}
                  {candidatura.createdAt && ` · ${formatDate(candidatura.createdAt)}`}
                </span>
              </span>
              <span className="hidden sm:block">
                <StatusBadge status={candidatura.status} size="sm" />
              </span>
              <span className="grid size-8 shrink-0 place-items-center rounded-full border border-border text-strong-foreground transition-colors group-hover:border-primary group-hover:bg-primary group-hover:text-white">
                <ChevronRight aria-hidden className="size-4" />
              </span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
