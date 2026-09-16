"use client"

import Link from "next/link"
import {
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  Building2,
  CalendarDays,
  CheckCircle2,
  Gift,
  Info,
  MapPin,
  Sparkles,
  Wallet,
  X,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { EntityAvatar } from "@/components/ui/entity-avatar"
import {
  VagaBenefits,
  VagaHighlights,
  VagaTags,
} from "@/components/vaga/vaga-facts"
import { VagaDescription } from "@/components/vaga/vaga-description"
import { ShareVagaButton } from "@/components/vaga/share-vaga-button"
import { formatCurrency, formatRelativeDate } from "@/lib/format"
import { formatDistance } from "@/lib/utils/distance"
import { cn } from "@/lib/utils"
import type { Vaga } from "@/lib/types/vaga.types"
import { StatusBadge } from "@/components/candidatura/candidatura-ui"
import { ETAPA_LABELS, type Candidatura } from "@/lib/types/candidatura.types"
import {
  CATEGORY_METADATA,
  NIVEL_METADATA,
} from "@/lib/constants/vaga-categories"

/**
 * Detalhe da vaga selecionada, exibido com visual moderno e rico.
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
  const company = vaga.nomeEmpresa ?? "Empresa confidencial"
  const categoryMeta = CATEGORY_METADATA[vaga.categoria]
  const nivelMeta = NIVEL_METADATA[vaga.nivelExperiencia]

  return (
    <aside
      aria-label={`Detalhes da vaga ${vaga.titulo}`}
      className={cn("flex flex-col overflow-hidden bg-card", className)}
    >
      {/* Header */}
      <header className="flex items-start gap-4 border-b border-border-subtle p-5 sm:p-6">
        <EntityAvatar name={company} size="lg" className="rounded-xl ring-1 ring-border/80" />

        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold text-muted-foreground">{company}</p>
          <h2 className="mt-1 text-xl font-bold leading-snug tracking-tight text-foreground text-pretty">
            {vaga.titulo}
          </h2>
          <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="size-3 text-muted-foreground/70" />
              {vaga.cidade ? `${vaga.cidade} - ${vaga.estado}` : vaga.estado || "Brasil"}
            </span>
            {vaga.distanciaKm != null && (
              <span className="rounded-md bg-primary-subtle px-1.5 py-0.5 text-[10px] font-bold text-primary">
                a {formatDistance(vaga.distanciaKm)}
              </span>
            )}
            {vaga.createdAt && (
              <>
                <span>•</span>
                <span>{formatRelativeDate(vaga.createdAt)}</span>
              </>
            )}
          </div>
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
              className="grid size-9 place-items-center rounded-full border border-border text-foreground transition-colors hover:bg-muted"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      </header>

      {/* Conteúdo rolável */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-5 p-5 sm:p-6">
          {/* Card de Remuneração e Visão Geral */}
          <div className="rounded-xl border border-border bg-surface/70 p-4 sm:p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Remuneração
                </span>
                <p className="mt-0.5 text-base font-bold text-foreground">
                  {vaga.salario > 0 ? (
                    <>
                      {formatCurrency(vaga.salario)}
                      <span className="text-xs font-normal text-muted-foreground"> /mês</span>
                    </>
                  ) : (
                    "A combinar"
                  )}
                </p>
              </div>

              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Setor & Especialidade
                </span>
                <p className="mt-0.5 text-xs font-semibold text-foreground truncate">
                  {categoryMeta?.sector ?? "Geral"} • {categoryMeta?.label ?? vaga.categoria}
                </p>
              </div>
            </div>

            {nivelMeta?.description && (
              <div className="mt-3 flex items-start gap-2 border-t border-border/60 pt-2.5 text-xs text-muted-foreground">
                <Info className="size-3.5 shrink-0 text-primary mt-0.5" />
                <span>
                  <strong>Nível {nivelMeta.tag}:</strong> {nivelMeta.description}
                </span>
              </div>
            )}
          </div>

          {/* Alerta de Candidatura já enviada */}
          {candidatura && (
            <div className="flex items-center gap-3 rounded-xl border border-success-border bg-success-subtle px-4 py-3">
              <CheckCircle2 className="size-4 shrink-0 text-success-foreground" aria-hidden />
              <p className="min-w-0 flex-1 text-xs font-semibold text-success-foreground text-pretty">
                Candidatura enviada · Etapa: {ETAPA_LABELS[candidatura.etapaAtual]}
              </p>
              <StatusBadge status={candidatura.status} size="sm" />
            </div>
          )}

          {/* Botões de Ação Principal */}
          <div className="flex flex-col gap-2 sm:flex-row">
            {candidatura ? (
              <Link href={`/candidaturas/${candidatura.id}`} className="btn-primary flex-1">
                Acompanhar candidatura
                <ArrowUpRight className="size-4" aria-hidden />
              </Link>
            ) : vaga.ativa && onApply ? (
              <button type="button" onClick={onApply} className="btn-primary flex-1 shadow-xs">
                Candidatar-se agora
                <ArrowRight className="size-4" aria-hidden />
              </button>
            ) : (
              <Link href={`/vaga/${vaga.id}`} className="btn-primary flex-1">
                Ver vaga completa
                <ArrowUpRight className="size-4" aria-hidden />
              </Link>
            )}

            <button
              type="button"
              onClick={onToggleSave}
              aria-pressed={saved}
              className={cn(
                "btn-secondary",
                saved && "border-primary bg-primary-subtle text-primary font-semibold",
              )}
            >
              <Bookmark className={cn("size-4", saved && "fill-current")} aria-hidden />
              {saved ? "Vaga salva" : "Salvar vaga"}
            </button>
          </div>

          {(candidatura || (vaga.ativa && onApply)) && (
            <Link
              href={`/vaga/${vaga.id}`}
              className="inline-flex items-center gap-1.5 self-start text-xs font-semibold text-primary transition-colors hover:text-primary-hover"
            >
              Abrir em página dedicada
              <ArrowUpRight className="size-3.5" aria-hidden />
            </Link>
          )}

          {/* Descrição */}
          <section aria-labelledby={`descricao-${vaga.id}`} className="border-t border-border-subtle pt-4">
            <h3 id={`descricao-${vaga.id}`} className="text-sm font-bold text-foreground">
              Sobre a oportunidade
            </h3>
            <VagaDescription description={vaga.descricao} className="mt-3" />
          </section>

          {/* Benefícios */}
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
                Benefícios inclusos
              </h3>
              <VagaBenefits beneficios={vaga.beneficios} className="mt-3" />
            </section>
          )}
        </div>
      </div>
    </aside>
  )
}

