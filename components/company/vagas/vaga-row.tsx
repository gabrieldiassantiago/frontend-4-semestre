import Link from "next/link"
import { BriefcaseBusiness, MapPin, Pencil, Trash2, Users } from "lucide-react"
import { ROUTES } from "@/lib/config/routes"
import { MODALIDADE_LABELS, NIVEL_LABELS, type Vaga } from "@/lib/types/vaga.types"
import { cn } from "@/lib/utils"

interface VagaRowProps {
  vaga: Vaga
  /** Exibe as ações de gestão (processo, editar, excluir). */
  detailed?: boolean
  deleting?: boolean
  onDelete?: () => void
  onToggleActive?: () => void
}

function StatusDot({ active }: { active: boolean }) {
  return <span aria-hidden className={cn("size-1.5 rounded-full", active ? "bg-success" : "bg-subtle-foreground")} />
}

export function VagaRow({ vaga, detailed, deleting, onDelete, onToggleActive }: VagaRowProps) {
  const meta = [
    vaga.cidade && vaga.estado ? `${vaga.cidade} - ${vaga.estado}` : vaga.cidade || vaga.estado,
    vaga.modalidade && MODALIDADE_LABELS[vaga.modalidade],
    vaga.nivelExperiencia && NIVEL_LABELS[vaga.nivelExperiencia],
  ].filter(Boolean)

  return (
    <div className="flex flex-col gap-3 px-4 py-4 transition-colors hover:bg-muted/60 sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <div className="flex min-w-0 items-center gap-3.5">
        <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary-subtle text-primary-subtle-foreground">
          <BriefcaseBusiness aria-hidden className="size-4" />
        </span>
        <div className="min-w-0">
          <Link
            href={ROUTES.company.editJob(vaga.id)}
            className="block truncate text-sm font-semibold tracking-tight text-foreground hover:text-primary"
          >
            {vaga.titulo}
          </Link>
          {meta.length > 0 && (
            <p className="mt-0.5 flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
              <MapPin aria-hidden className="size-3 shrink-0" />
              <span className="truncate">{meta.join(" · ")}</span>
            </p>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-between gap-2 pl-[3.375rem] sm:justify-end sm:pl-0">
        {onToggleActive ? (
          <button
            type="button"
            onClick={onToggleActive}
            aria-label={vaga.ativa ? `Pausar ${vaga.titulo}` : `Publicar ${vaga.titulo}`}
            title={vaga.ativa ? "Clique para pausar" : "Clique para publicar"}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-md border border-border bg-card px-3 text-xs font-medium text-strong-foreground transition-colors hover:border-border-strong hover:bg-muted"
          >
            <StatusDot active={vaga.ativa} />
            {vaga.ativa ? "Publicada" : "Pausada"}
          </button>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <StatusDot active={vaga.ativa} />
            {vaga.ativa ? "Ativa" : "Pausada"}
          </span>
        )}

        {detailed && (
          <div className="flex items-center gap-0.5">
            <Link
              href={`${ROUTES.company.processes}?vaga=${encodeURIComponent(vaga.id)}`}
              aria-label={`Ver processo de ${vaga.titulo}`}
              title="Ver processo seletivo"
              className="grid size-9 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Users aria-hidden className="size-4" />
            </Link>
            <Link
              href={ROUTES.company.editJob(vaga.id)}
              aria-label={`Editar ${vaga.titulo}`}
              title="Editar vaga"
              className="grid size-9 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Pencil aria-hidden className="size-4" />
            </Link>
            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                disabled={deleting}
                aria-label={`Excluir ${vaga.titulo}`}
                title="Excluir vaga"
                className="grid size-9 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-danger-subtle hover:text-danger-foreground disabled:opacity-40"
              >
                <Trash2 aria-hidden className="size-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
