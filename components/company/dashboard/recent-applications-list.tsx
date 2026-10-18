import Link from "next/link"
import { Users } from "lucide-react"
import { EntityAvatar } from "@/components/ui/entity-avatar"
import { SectionLink } from "@/components/ui/page"
import { ROUTES } from "@/lib/config/routes"
import { formatRelativeDate } from "@/lib/format"
import { ETAPA_SHORT_LABELS, STATUS_LABELS, type Candidatura } from "@/lib/types/candidatura.types"
import { cn } from "@/lib/utils"

export function RecentApplicationsList({ candidaturas }: { candidaturas: Candidatura[] }) {
  return (
    <section aria-labelledby="recent-title" className="flex min-w-0 flex-col rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between gap-3 border-b border-border-subtle px-5 py-4">
        <h2 id="recent-title" className="text-base font-semibold tracking-tight text-foreground">
          Candidaturas recentes
        </h2>
        {candidaturas.length > 0 && <SectionLink href={ROUTES.company.candidates}>Ver todas</SectionLink>}
      </div>

      {candidaturas.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 py-10 text-center">
          <span className="grid size-10 place-items-center rounded-full bg-muted text-muted-foreground">
            <Users aria-hidden className="size-5" />
          </span>
          <p className="text-sm font-semibold text-foreground">Nenhuma candidatura ainda</p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Assim que candidatos se inscreverem, eles aparecerão aqui.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-border-subtle">
          {candidaturas.map((item) => {
            const closed = item.status !== "EM_ANDAMENTO"
            return (
              <li key={item.id}>
                <Link
                  href={ROUTES.company.candidate(item.id)}
                  className="group flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-muted"
                >
                  <EntityAvatar name={item.candidatoNome} src={item.candidatoImagemUrl} size="sm" className="rounded-full" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-foreground group-hover:text-primary">
                      {item.candidatoNome ?? "Candidato"}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {item.vagaTitulo}
                      {item.createdAt && ` · ${formatRelativeDate(item.createdAt)}`}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "shrink-0 rounded-md px-2 py-1 text-[11px] font-semibold",
                      !closed && "bg-primary-subtle text-primary-subtle-foreground",
                      item.status === "APROVADA" && "bg-success-subtle text-success-foreground",
                      (item.status === "REPROVADA" || item.status === "CANCELADA") && "bg-muted text-muted-foreground",
                    )}
                  >
                    {closed ? STATUS_LABELS[item.status] : ETAPA_SHORT_LABELS[item.etapaAtual]}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
