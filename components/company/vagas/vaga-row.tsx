import { BriefcaseBusiness, MapPin, Pencil, Trash2 } from "lucide-react"
import { MODALIDADE_LABELS, NIVEL_LABELS, type Vaga } from "@/lib/types/vaga.types"
import { Badge } from "@/components/ui/badge"

interface VagaRowProps {
  vaga: Vaga
  detailed?: boolean
  deleting?: boolean
  onEdit?: () => void
  onDelete?: () => void
  onToggleActive?: () => void
}

export function VagaRow({
  vaga,
  detailed,
  deleting,
  onEdit,
  onDelete,
  onToggleActive,
}: VagaRowProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 p-4 transition-colors hover:bg-muted/60 sm:flex-nowrap sm:px-6 sm:py-5">
      <span
        aria-hidden
        className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary-subtle text-primary-subtle-foreground"
      >
        <BriefcaseBusiness className="size-4.5" />
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold tracking-tight text-foreground">{vaga.titulo}</p>
        <p className="mt-1 flex items-center gap-1.5 truncate text-sm text-muted-foreground">
          <MapPin className="size-3.5 shrink-0" aria-hidden />
          <span className="truncate">
            {vaga.cidade}, {vaga.estado} · {MODALIDADE_LABELS[vaga.modalidade]} ·{" "}
            {NIVEL_LABELS[vaga.nivelExperiencia]}
          </span>
        </p>
      </div>

      {onToggleActive ? (
        <button
          type="button"
          onClick={onToggleActive}
          aria-pressed={vaga.ativa}
          className="rounded-full focus-visible:outline-none"
          title={vaga.ativa ? "Despublicar vaga" : "Publicar vaga"}
        >
          <Badge variant={vaga.ativa ? "success" : "neutral"}>
            <span
              aria-hidden
              className={
                vaga.ativa
                  ? "size-1.5 rounded-full bg-success"
                  : "size-1.5 rounded-full bg-subtle-foreground"
              }
            />
            {vaga.ativa ? "Publicada" : "Inativa"}
          </Badge>
        </button>
      ) : (
        <Badge variant={vaga.ativa ? "success" : "neutral"}>
          {vaga.ativa ? "Publicada" : "Inativa"}
        </Badge>
      )}

      {detailed && (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onEdit}
            aria-label={`Editar vaga ${vaga.titulo}`}
            className="grid size-10 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-primary-subtle hover:text-primary"
          >
            <Pencil className="size-4" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={deleting}
            aria-label={`Remover vaga ${vaga.titulo}`}
            className="grid size-10 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:border-danger-border hover:bg-danger-subtle hover:text-danger-foreground disabled:opacity-40"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      )}
    </div>
  )
}
