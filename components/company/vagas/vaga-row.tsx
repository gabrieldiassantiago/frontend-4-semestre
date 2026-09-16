import Link from "next/link"
import { BriefcaseBusiness, MapPin, Pencil, Trash2 } from "lucide-react"
import { MODALIDADE_LABELS, NIVEL_LABELS, type Vaga } from "@/lib/types/vaga.types"
import { cn } from "@/lib/utils"

interface VagaRowProps {
  vaga: Vaga
  detailed?: boolean
  deleting?: boolean
  onDelete?: () => void
  onToggleActive?: () => void
}

export function VagaRow({
  vaga,
  detailed,
  deleting,
  onDelete,
  onToggleActive,
}: VagaRowProps) {
  return (
    <div className="group flex items-center justify-between gap-4 p-4 transition-all duration-200 hover:bg-muted/30 sm:px-6">
      <div className="flex min-w-0 items-center gap-4">
        {/* Ícone com cantos suaves */}
        <div className="grid size-10 shrink-0 place-items-center rounded-2xl bg-muted/60 text-muted-foreground transition-colors group-hover:text-primary">
          <BriefcaseBusiness className="size-4" />
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary">
            {vaga.titulo}
          </p>

          <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3 shrink-0" />
              {vaga.cidade} - {vaga.estado}
            </span>
            <span>•</span>
            <span>{MODALIDADE_LABELS[vaga.modalidade]}</span>
            <span>•</span>
            <span>{NIVEL_LABELS[vaga.nivelExperiencia]}</span>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        {/* Ponto de status sutil */}
        {onToggleActive ? (
          <button
            type="button"
            onClick={onToggleActive}
            aria-label={vaga.ativa ? "Pausar vaga" : "Publicar vaga"}
            className="flex items-center gap-1.5 rounded-full border border-border-subtle/80 bg-background/50 px-3 py-1 text-xs font-medium text-foreground transition-all hover:border-border hover:bg-background active:scale-95"
          >
            <span
              className={cn(
                "size-1.5 rounded-full",
                vaga.ativa ? "bg-emerald-500" : "bg-muted-foreground"
              )}
            />
            {vaga.ativa ? "Publicada" : "Pausada"}
          </button>
        ) : (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span
              className={cn(
                "size-1.5 rounded-full",
                vaga.ativa ? "bg-emerald-500" : "bg-muted-foreground"
              )}
            />
            {vaga.ativa ? "Ativa" : "Pausada"}
          </span>
        )}

        {/* Botões de Ação estilo Ghost Pill */}
        {detailed && (
          <div className="flex items-center gap-1">
            <Link
              href={`/empresa/vagas/${vaga.id}/editar`}
              aria-label={`Editar ${vaga.titulo}`}
              className="grid size-8 place-items-center rounded-full text-muted-foreground transition-all hover:bg-muted hover:text-foreground active:scale-95"
            >
              <Pencil className="size-3.5" />
            </Link>
            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                disabled={deleting}
                aria-label={`Excluir ${vaga.titulo}`}
                className="grid size-8 place-items-center rounded-full text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive active:scale-95 disabled:opacity-40"
              >
                <Trash2 className="size-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}