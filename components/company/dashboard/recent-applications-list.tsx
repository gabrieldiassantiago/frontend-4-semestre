import Link from "next/link"
import { ChevronRight, Users } from "lucide-react"
import { EntityAvatar } from "@/components/ui/entity-avatar"
import { EmptyState } from "@/components/ui/states"
import { StatusBadge } from "@/components/shared/candidatura/candidatura-ui"
import { ROUTES } from "@/lib/config/routes"
import { formatRelativeDate } from "@/lib/format"
import type { Candidatura } from "@/lib/types/candidatura.types"

export function RecentApplicationsList({ candidaturas }: { candidaturas: Candidatura[] }) {
  if (candidaturas.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="Nenhuma candidatura ainda"
        description="Assim que candidatos se inscreverem nas suas vagas, eles aparecerão aqui."
      />
    )
  }

  return (
    <ul className="divide-y divide-border-subtle overflow-hidden rounded-card border border-border bg-card">
      {candidaturas.map((candidatura) => (
        <li key={candidatura.id}>
          <Link
            href={ROUTES.company.candidate(candidatura.id)}
            className="group flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-muted sm:px-5"
          >
            <EntityAvatar name={candidatura.candidatoNome} size="sm" className="rounded-full" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground group-hover:text-primary">
                {candidatura.candidatoNome ?? "Candidato"}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {candidatura.vagaTitulo}
                {candidatura.createdAt && ` · ${formatRelativeDate(candidatura.createdAt)}`}
              </p>
            </div>
            <StatusBadge status={candidatura.status} size="sm" />
            <ChevronRight aria-hidden className="hidden size-4 shrink-0 text-subtle-foreground sm:block" />
          </Link>
        </li>
      ))}
    </ul>
  )
}
