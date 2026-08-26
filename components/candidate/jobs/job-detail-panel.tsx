"use client"

import Link from "next/link"
import {
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  CalendarDays,
  CheckCircle2,
  Gift,
  X,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { EntityAvatar } from "@/components/ui/entity-avatar"
import { VagaBenefits, VagaHighlights, VagaTags } from "@/components/vaga/vaga-facts"
import { VagaDescription } from "@/components/vaga/vaga-description"
import { ShareVagaButton } from "@/components/vaga/share-vaga-button"
import { formatRelativeDate } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { Vaga } from "@/lib/types/vaga.types"
import { StatusBadge } from "@/components/candidatura/candidatura-ui"
import { ETAPA_LABELS, type Candidatura } from "@/lib/types/candidatura.types"

/**
 * Detalhe da vaga selecionada. Usado como coluna fixa no desktop e dentro da
 * gaveta no mobile — nesse caso `onClose` é omitido, porque a própria gaveta
 * já oferece o botão de fechar.
 */
export function JobDetailPanel({
  vaga,
  saved,
  candidatura,
  onToggleSave,
  onApply,
  onClose,
  className,
}: {
  vaga: Vaga
  saved: boolean
  /** Candidatura já enviada para esta vaga, quando existir. */
  candidatura?: Candidatura | null
  onToggleSave: () => void
  onApply?: () => void
  onClose?: () => void
  className?: string
}) {
  const company = vaga.companyName ?? "Empresa confidencial"

  return (
    <aside
      aria-label={`Detalhes da vaga ${vaga.titulo}`}
      className={cn("flex flex-col overflow-hidden bg-card", className)}
    >
      <header className="flex items-start gap-3 border-b border-border-subtle p-5">
        <EntityAvatar name={company} size="md" />

        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold text-muted-foreground">{company}</p>
          <h2 className="mt-1 text-base font-bold leading-snug tracking-tight text-foreground text-pretty">
            {vaga.titulo}
          </h2>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <ShareVagaButton
            path={`/vaga/${vaga.id}`}
            title={`${vaga.titulo} — ${company}`}
            variant="icon"
          />
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar detalhes"
              className="grid size-9 place-items-center rounded-full border border-border text-strong-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-4 p-5">
          <div className="flex flex-wrap items-center gap-1.5">
            <VagaTags vaga={vaga} size="sm" />
            {!vaga.ativa && <Badge variant="danger" size="sm">Encerrada</Badge>}
          </div>

          <VagaHighlights vaga={vaga} />

          {vaga.createdAt && (
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <CalendarDays className="size-3.5" aria-hidden />
              Publicada {formatRelativeDate(vaga.createdAt)}
            </p>
          )}

          {candidatura && (
            <div className="flex items-center gap-3 rounded-xl border border-success-border bg-success-subtle px-4 py-3">
              <CheckCircle2 className="size-4 shrink-0 text-success-foreground" aria-hidden />
              <p className="min-w-0 flex-1 text-xs font-semibold text-success-foreground text-pretty">
                Candidatura enviada · {ETAPA_LABELS[candidatura.etapaAtual]}
              </p>
              <StatusBadge status={candidatura.status} size="sm" />
            </div>
          )}

          <div className="flex flex-col gap-2 border-t border-border-subtle pt-4 sm:flex-row">
            {candidatura ? (
              <Link href={`/candidaturas/${candidatura.id}`} className="btn-primary flex-1">
                Acompanhar processo
                <ArrowUpRight className="size-4" aria-hidden />
              </Link>
            ) : vaga.ativa && onApply ? (
              <button type="button" onClick={onApply} className="btn-primary flex-1">
                Candidatar-se
                <ArrowRight className="size-4" aria-hidden />
              </button>
            ) : (
              <Link href={`/vaga/${vaga.id}`} className="btn-primary flex-1">
                Abrir vaga completa
                <ArrowUpRight className="size-4" aria-hidden />
              </Link>
            )}

            <button
              type="button"
              onClick={onToggleSave}
              aria-pressed={saved}
              className={cn(
                "btn-secondary",
                saved && "border-primary bg-primary-subtle text-primary-subtle-foreground",
              )}
            >
              <Bookmark className={cn("size-4", saved && "fill-current")} aria-hidden />
              {saved ? "Salva" : "Salvar"}
            </button>
          </div>

          {(candidatura || (vaga.ativa && onApply)) && (
            <Link
              href={`/vaga/${vaga.id}`}
              className="inline-flex items-center gap-1.5 self-start text-xs font-semibold text-primary transition-colors hover:text-primary-hover"
            >
              Abrir a página completa da vaga
              <ArrowUpRight className="size-3.5" aria-hidden />
            </Link>
          )}

          <section aria-labelledby={`descricao-${vaga.id}`} className="border-t border-border-subtle pt-4">
            <h3 id={`descricao-${vaga.id}`} className="text-sm font-bold text-foreground">
              Descrição da vaga
            </h3>
            <VagaDescription description={vaga.descricao} className="mt-3" />
          </section>

          {vaga.beneficios && (
            <section
              aria-labelledby={`beneficios-${vaga.id}`}
              className="border-t border-border-subtle pt-4"
            >
              <h3
                id={`beneficios-${vaga.id}`}
                className="flex items-center gap-2 text-sm font-bold text-foreground"
              >
                <Gift className="size-4 text-primary" aria-hidden />
                Benefícios
              </h3>
              <VagaBenefits beneficios={vaga.beneficios} className="mt-3" />
            </section>
          )}
        </div>
      </div>
    </aside>
  )
}
