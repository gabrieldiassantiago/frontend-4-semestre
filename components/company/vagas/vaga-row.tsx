import Link from "next/link"
import { ArrowUpRight, BriefcaseBusiness, Code2, Database, MapPin, Megaphone, Pencil, PenTool, Trash2, type LucideIcon } from "lucide-react"
import { ROUTES } from "@/lib/config/routes"
import { formatCurrency, formatRelativeDate } from "@/lib/format"
import { CATEGORIA_LABELS, MODALIDADE_LABELS, type Vaga, type VagaCategoria } from "@/lib/types/vaga.types"
import { cn } from "@/lib/utils"

interface VagaRowProps {
  vaga: Vaga
  detailed?: boolean
  deleting?: boolean
  updating?: boolean
  onDelete?: () => void
  onToggleActive?: () => void
}

const CATEGORY_ICONS: Partial<Record<VagaCategoria, LucideIcon>> = {
  DESENVOLVIMENTO_SOFTWARE: Code2,
  DESIGN_UX_UI: PenTool,
  CIENCIA_DE_DADOS_IA: Database,
  MARKETING_DIGITAL: Megaphone,
}

export function VagaRow({ vaga, detailed, deleting, updating, onDelete, onToggleActive }: VagaRowProps) {
  const Icon = CATEGORY_ICONS[vaga.categoria] ?? BriefcaseBusiness
  const location = [vaga.cidade, vaga.estado].filter(Boolean).join(", ")
  const statusClassName = cn(
    "inline-flex min-h-8 items-center gap-1.5 rounded-full px-3 text-xs font-medium transition-colors",
    vaga.ativa ? "bg-mint-subtle text-mint-strong" : "bg-surface text-muted-foreground",
  )

  return (
    <article className="group flex h-full min-w-0 flex-col rounded-3xl border border-border bg-card p-5 shadow-card transition-[box-shadow,border-color] duration-200 hover:border-primary-soft hover:shadow-raised sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <span className="grid size-12 place-items-center rounded-2xl border border-primary/10 bg-primary-subtle text-primary">
          <Icon className="size-6" strokeWidth={1.5} aria-hidden />
        </span>
        {onToggleActive ? (
          <button type="button" onClick={onToggleActive} disabled={updating || deleting}
            aria-label={vaga.ativa ? `Pausar ${vaga.titulo}` : `Publicar ${vaga.titulo}`}
            title={vaga.ativa ? "Clique para pausar" : "Clique para publicar"}
            className={cn(statusClassName, "hover:ring-1 hover:ring-current disabled:cursor-wait disabled:opacity-50")}>
            <span aria-hidden className={cn("size-1.5 rounded-full", vaga.ativa ? "bg-mint-strong" : "bg-subtle-foreground")} />
            {updating ? "Atualizando…" : vaga.ativa ? "Publicada" : "Pausada"}
          </button>
        ) : <span className={statusClassName}>{vaga.ativa ? "Publicada" : "Pausada"}</span>}
      </div>

      <div className="mb-6 mt-6">
        <p className="text-xs font-medium leading-5 text-primary-subtle-foreground">{CATEGORIA_LABELS[vaga.categoria] ?? "Oportunidade"}</p>
        <h2 className="mt-1.5 break-words text-lg font-semibold leading-7 tracking-[-0.025em] text-ink">
          <Link href={ROUTES.company.editJob(vaga.id)} className="rounded-sm transition-colors hover:text-primary">{vaga.titulo}</Link>
        </h2>
        <p className="mt-2 flex flex-wrap items-center gap-1.5 text-xs leading-5 text-muted-foreground">
          <MapPin className="size-3.5 shrink-0" aria-hidden />
          {location || "Local não informado"}<span aria-hidden>·</span>{MODALIDADE_LABELS[vaga.modalidade]}
        </p>
      </div>

      <dl className="mt-auto grid grid-cols-2 gap-3 rounded-xl bg-surface px-4 py-3 text-strong-foreground">
        <div><dt className="text-xs text-muted-foreground">Salário mensal</dt><dd className="mt-1 text-sm font-semibold tracking-tight">{vaga.salario > 0 ? formatCurrency(vaga.salario) : "A combinar"}</dd></div>
        <div><dt className="text-xs text-muted-foreground">Posições na vaga</dt><dd className="mt-1 text-sm font-semibold">{vaga.quantidadeVagas ?? "—"}</dd></div>
      </dl>

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="min-w-0 text-[11px] leading-5 text-muted-foreground">{vaga.createdAt ? `Criada ${formatRelativeDate(vaga.createdAt)}` : "Oportunidade da sua empresa"}</p>
        {Boolean(vaga.etapas?.length) && <span className="shrink-0 text-[11px] text-muted-foreground">{vaga.etapas!.length} etapas</span>}
      </div>

      {detailed && (
        <div className="mt-5 flex items-center justify-between gap-3">
          <Link href={`${ROUTES.company.processes}?vaga=${encodeURIComponent(vaga.id)}`} className="inline-flex min-h-10 items-center gap-2 rounded-full bg-primary-subtle px-4 text-sm font-semibold text-primary-subtle-foreground transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:outline-primary">
            Ver candidatos<ArrowUpRight className="size-3.5" aria-hidden />
          </Link>
          <div className="flex items-center gap-1">
            <Link href={ROUTES.company.editJob(vaga.id)} aria-label={`Editar ${vaga.titulo}`} title="Editar vaga" className="grid size-10 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary-soft hover:bg-primary-subtle hover:text-primary-deep">
              <Pencil className="size-4" aria-hidden />
            </Link>
            {onDelete && <button type="button" onClick={onDelete} disabled={deleting || updating} aria-label={`Excluir ${vaga.titulo}`} title="Excluir vaga" className="grid size-10 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-danger-subtle hover:text-danger-foreground disabled:opacity-40"><Trash2 className="size-4" aria-hidden /></button>}
          </div>
        </div>
      )}
    </article>
  )
}
