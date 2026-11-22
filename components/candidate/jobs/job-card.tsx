"use client"

import React from "react"
import {
  ArrowUpRight,
  Banknote,
  Bookmark,
  Check,
  Clock,
  Globe2,
  Building2,
  Hourglass,
  MapPin,
  Navigation,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { formatCurrency, formatRelativeDate } from "@/lib/format"
import { CATEGORIA_LABELS, MODALIDADE_LABELS } from "@/lib/types/vaga.types"
import type { Vaga, VagaModalidade } from "@/lib/types/vaga.types"
import type { StatusCandidatura } from "@/lib/types/candidatura.types"
import { CompanyLogo } from "@/components/shared/company-logo"

const MODALIDADE_ICONS: Record<VagaModalidade, LucideIcon> = {
  REMOTO: Globe2,
  HIBRIDO: Building2,
  PRESENCIAL: MapPin,
}

const APPLIED_BADGES: Record<
  StatusCandidatura,
  { label: string; className: string; icon?: LucideIcon }
> = {
  EM_ANDAMENTO: { label: "Em andamento", className: "bg-primary-subtle text-primary", icon: Hourglass },
  APROVADA: { label: "Aprovado", className: "bg-success-subtle text-success-foreground", icon: Check },
  REPROVADA: { label: "Não aprovado", className: "bg-danger-subtle text-danger-foreground" },
  CANCELADA: { label: "Cancelada", className: "bg-muted text-muted-foreground" },
}

function stripMarkup(text: string) {
  return text
    .replace(/<[^>]*>/g, " ")
    .replace(/[#*_`~]/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

export function JobCard({
  vaga,
  saved,
  selected,
  applied,
  onSelect,
  onToggleSave,
}: {
  vaga: Vaga
  saved: boolean
  selected: boolean
  applied?: StatusCandidatura
  onSelect: () => void
  onToggleSave: () => void
}) {
  const company = vaga.nomeEmpresa || "Empresa"
  const location =
    vaga.cidade && vaga.estado ? `${vaga.cidade}, ${vaga.estado}` : vaga.cidade || "Brasil"
  const hasSalary = !vaga.salarioACombinar && vaga.salario > 0
  const modalidade = MODALIDADE_LABELS[vaga.modalidade] || "Híbrido"
  const ModalidadeIcon = MODALIDADE_ICONS[vaga.modalidade] ?? Building2
  const categoria = CATEGORIA_LABELS[vaga.categoria]
  const published = vaga.createdAt ? formatRelativeDate(vaga.createdAt) : ""
  const isNew =
    vaga.createdAt != null &&
    Date.now() - new Date(vaga.createdAt).getTime() <= 3 * 86_400_000
  const snippet = vaga.descricao ? stripMarkup(vaga.descricao) : ""
  const tags = (vaga.metaTags ?? []).slice(0, 3)

  const appliedBadge = applied ? APPLIED_BADGES[applied] : null
  const AppliedIcon = appliedBadge?.icon

  return (
    <article
      data-selected={selected || undefined}
      className={cn(
        "group relative isolate overflow-hidden rounded-[28px] border bg-card p-5 transition-colors duration-200 sm:p-6",
        "hover:border-border-strong",
        selected ? "border-primary" : "border-border/60",
      )}
    >

      <div className="flex items-start gap-4">
        <CompanyLogo name={company} url={vaga.logoUrlEmpresa} size="lg" />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {appliedBadge ? (
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                  appliedBadge.className,
                )}
              >
                {AppliedIcon && <AppliedIcon className="size-3" aria-hidden />}
                {appliedBadge.label}
              </span>
            ) : isNew ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary-subtle px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                <Sparkles className="size-3" aria-hidden />
                Nova
              </span>
            ) : null}
            {categoria && (
              <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                {categoria}
              </span>
            )}
          </div>

          <h3 className="mt-1.5 text-lg font-semibold leading-snug tracking-tight text-foreground">
            <button
              type="button"
              onClick={onSelect}
              className="text-left after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-inset focus-visible:after:ring-primary"
            >
              {vaga.titulo}
            </button>
          </h3>
          <p className="mt-0.5 truncate text-sm text-muted-foreground">{company}</p>
        </div>

        <button
          type="button"
          onClick={onToggleSave}
          aria-pressed={saved}
          aria-label={saved ? `Remover ${vaga.titulo} dos salvos` : `Salvar ${vaga.titulo}`}
          className={cn(
            "relative z-10 grid size-11 shrink-0 place-items-center rounded-full border transition-colors duration-200",
            saved
              ? "border-primary bg-primary text-white"
              : "border-border text-strong-foreground hover:border-border-strong hover:text-primary",
          )}
        >
          <Bookmark aria-hidden strokeWidth={1.75} className={cn("size-[18px]", saved && "fill-current")} />
        </button>
      </div>

      {/* Fatos principais em linha, com o salário em destaque */}
      <dl className="mt-5 flex flex-wrap items-center gap-2 text-[13px] [&>div]:min-h-9 [&>div]:rounded-full [&>div]:bg-surface [&>div]:px-3.5">
        <div className="flex items-center gap-1.5 text-foreground">
          <dt className="sr-only">Salário</dt>
          <Banknote aria-hidden className="size-4 text-mint-strong" />
          <dd className={cn("font-semibold", !hasSalary && "font-medium text-muted-foreground")}>
            {hasSalary ? `${formatCurrency(vaga.salario)}/mês` : "A combinar"}
          </dd>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <dt className="sr-only">Local</dt>
          <MapPin aria-hidden className="size-4" />
          <dd>
            {location}
            {vaga.distanciaKm != null && (
              <span className="ml-1.5 inline-flex items-center gap-0.5 rounded-full bg-card px-1.5 py-0.5 text-[11px] font-medium text-primary">
                <Navigation aria-hidden className="size-3" />
                {vaga.distanciaKm.toFixed(1)} km
              </span>
            )}
          </dd>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <dt className="sr-only">Modalidade</dt>
          <ModalidadeIcon aria-hidden className="size-4" />
          <dd>{modalidade}</dd>
        </div>
      </dl>

      {snippet && (
        <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{snippet}</p>
      )}

      {tags.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Palavras-chave">
          {tags.map((tag) => (
            <li
              key={tag}
              className="rounded-full border border-border px-2.5 py-0.5 text-[11px] font-medium text-strong-foreground"
            >
              {tag}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-5 flex items-center justify-between gap-3 text-xs text-muted-foreground">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          {published && (
            <span className="inline-flex items-center gap-1.5">
              <Clock aria-hidden className="size-3.5" />
              Publicada {published}
            </span>
          )}
          {vaga.quantidadeVagas != null && vaga.quantidadeVagas > 1 && (
            <span className="inline-flex items-center gap-1.5">
              <Users aria-hidden className="size-3.5" />
              {vaga.quantidadeVagas} vagas
            </span>
          )}
        </div>
        <span
          aria-hidden
          className="inline-flex shrink-0 items-center gap-2.5 text-sm font-medium text-primary"
        >
          Ver vaga
          <span className="grid size-9 place-items-center rounded-full border border-border transition-colors group-hover:border-primary group-hover:bg-primary group-hover:text-white">
            <ArrowUpRight strokeWidth={1.75} className="size-4" />
          </span>
        </span>
      </div>
    </article>
  )
}
