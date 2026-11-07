"use client"

import React from "react"
import {
  Bookmark,
  Wallet,
  Check,
  ChevronRight,
  Clock,
  Hourglass,
  MapPin,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { formatCurrency, formatRelativeDate } from "@/lib/format"
import { CATEGORIA_LABELS, MODALIDADE_LABELS } from "@/lib/types/vaga.types"
import type { Vaga } from "@/lib/types/vaga.types"
import type { StatusCandidatura } from "@/lib/types/candidatura.types"
import { CompanyLogo } from "@/components/shared/company-logo"

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
  const locationText =
    vaga.cidade && vaga.estado ? `${vaga.cidade} - ${vaga.estado}` : vaga.cidade || "Brasil"

  const salaryText =
    vaga.salario && vaga.salario > 0 ? `${formatCurrency(vaga.salario)} / mês` : "A combinar"

  const relativeDateText =
    vaga.createdAt ? `Publicado ${formatRelativeDate(vaga.createdAt)}` : "Recente"

  // Determina o status badge (Prioridade: aplicado real -> salvo -> nova)
  const renderStatusBadge = () => {
    if (applied === "EM_ANDAMENTO") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-info-subtle px-3 py-1 text-xs font-semibold text-info">
          <Hourglass className="size-3.5" aria-hidden />
          Candidatura em andamento
        </span>
      )
    }

    if (applied === "APROVADA") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-success-subtle px-3 py-1 text-xs font-semibold text-success-foreground">
          <Check className="size-3.5" aria-hidden />
          Aprovado
        </span>
      )
    }

    if (applied === "REPROVADA") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-danger-subtle px-3 py-1 text-xs font-semibold text-danger-foreground">
          Não aprovado
        </span>
      )
    }

    if (applied === "CANCELADA") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
          Candidatura cancelada
        </span>
      )
    }

    if (saved) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-semibold text-strong-foreground">
          <Bookmark className="size-3.5 fill-current" />
          Salva
        </span>
      )
    }

    if (vaga.createdAt) {
      const days = Math.floor((Date.now() - new Date(vaga.createdAt).getTime()) / 86_400_000)
      if (days <= 3) {
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-primary">
            <Sparkles className="size-3.5" />
            Nova
          </span>
        )
      }
    }

    return null
  }

  const modalidadeLabel = MODALIDADE_LABELS[vaga.modalidade] || "Híbrido"
  const categoriaLabel = CATEGORIA_LABELS[vaga.categoria] || "Geral"

  return (
    <article className={cn(
      "group relative isolate rounded-xl border bg-card p-4 transition-[border-color,box-shadow] duration-200 hover:border-primary/30 hover:shadow-sm sm:px-5",
      selected ? "border-primary/40 ring-1 ring-primary/10" : "border-border/80",
    )}>
      <div className="flex items-start gap-3">
        <CompanyLogo name={company} url={vaga.logoUrlEmpresa} size="md" />
        <div className="min-w-0 flex-1">
          <p className="text-xs leading-4 text-muted-foreground">{company}</p>
          <h3 className="mt-1 text-sm font-semibold leading-snug tracking-tight text-foreground transition-colors group-hover:text-primary sm:text-base">
            <button type="button" onClick={onSelect} className="text-left after:absolute after:inset-0 after:rounded-xl focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-primary">
              {vaga.titulo}
            </button>
          </h3>
        </div>
        <div className="hidden shrink-0 items-center gap-2 sm:flex">{renderStatusBadge()}</div>
        <button type="button" onClick={onToggleSave} aria-pressed={saved}
          aria-label={saved ? `Remover ${vaga.titulo} dos salvos` : `Salvar ${vaga.titulo}`}
          className={cn("relative z-10 -mr-1 -mt-1 grid size-11 shrink-0 place-items-center rounded-lg transition-colors duration-200", saved ? "bg-primary-subtle text-primary" : "text-muted-foreground hover:bg-primary-subtle hover:text-primary")}>
          <Bookmark aria-hidden className={cn("size-[18px]", saved && "fill-current")} />
        </button>
      </div>
      <div className="mt-3 sm:pl-14">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5"><MapPin aria-hidden className="size-3.5" />{locationText}</span>
          <span className="inline-flex items-center gap-1.5 font-medium text-strong-foreground"><Wallet aria-hidden className="size-3.5 text-muted-foreground" />{salaryText}</span>
          <span className="rounded-md bg-primary-subtle px-2 py-0.5 text-[11px] font-medium text-primary-subtle-foreground">{modalidadeLabel}</span>
          <span className="hidden text-[11px] md:inline">{categoriaLabel}</span>
          {vaga.distanciaKm != null && <span>A {vaga.distanciaKm.toFixed(1)} km</span>}
        </div>
        {vaga.descricao && (
          <p className="mt-2 line-clamp-1 text-xs leading-5 text-muted-foreground">
            {vaga.descricao.replace(/<[^>]*>/g, " ").replace(/[#*_`~]/g, "").replace(/\s+/g, " ").trim()}
          </p>
        )}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground"><Clock aria-hidden className="size-3" />{relativeDateText}</span>
          <span className="sm:hidden">{renderStatusBadge()}</span>
          <span aria-hidden className="inline-flex items-center gap-1 text-xs font-medium text-primary">Ver detalhes<ChevronRight className="size-3.5 transition-transform duration-200 motion-safe:group-hover:translate-x-0.5" /></span>
        </div>
      </div>
    </article>
  )
}
