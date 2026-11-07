import { etapaLabel } from "@/lib/types/candidatura.types"
import { etapasDaVaga, type Candidatura } from "@/lib/types/candidatura.types"
import { cn } from "@/lib/utils"

/** Barra de etapas compacta com rótulo curto, para tabelas e cards da empresa. */
export function StageProgress({ item, className }: { item: Candidatura; className?: string }) {
  const flow = etapasDaVaga(item.etapasVaga)
  const current = flow.indexOf(item.etapaAtual)
  const tone =
    item.status === "REPROVADA" ? "bg-danger" : item.status === "APROVADA" ? "bg-success" : item.status === "CANCELADA" ? "bg-border-strong" : "bg-primary"

  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <span className="truncate text-xs font-semibold text-strong-foreground">
        {etapaLabel(item.etapaAtual, item.etapasVaga, item.etapaAtualDescricao)}
        <span className="ml-1 font-normal text-subtle-foreground">
          {current + 1}/{flow.length}
        </span>
      </span>
      <span className="flex gap-0.5" aria-hidden>
        {flow.map((etapa, index) => (
          <span key={etapa} className={cn("h-1 w-4 rounded-full", index <= current ? tone : "bg-border")} />
        ))}
      </span>
    </div>
  )
}
