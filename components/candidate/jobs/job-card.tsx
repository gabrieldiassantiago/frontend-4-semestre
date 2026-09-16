"use client"

import React from "react"
import {
  Bookmark,
  Briefcase,
  Check,
  ChevronRight,
  Clock,
  Hourglass,
  MapPin,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { formatRelativeDate } from "@/lib/format"
import { MODALIDADE_LABELS, NIVEL_LABELS } from "@/lib/types/vaga.types"
import type { StatusCandidatura } from "@/lib/types/candidatura.types"
import { CompanyBrandLogo } from "./company-brand-logo"
import { ApplicantFacepile } from "./applicant-facepile"
import type { ExtendedVaga } from "@/lib/data/mock-jobs"

export function JobCard({
  vaga,
  saved,
  selected,
  applied,
  onSelect,
  onToggleSave,
}: {
  vaga: ExtendedVaga
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
    vaga.salario && vaga.salario > 0 ? `${(vaga.salario)} / mês` : "A combinar"

  const relativeDateText =
    vaga.relativeTimeText || (vaga.createdAt ? `Publicado ${formatRelativeDate(vaga.createdAt)}` : "Recente")

  // Determina o status badge (Prioridade: aplicado real -> badge mock/definido -> novo)
  const renderStatusBadge = () => {
    if (applied === "EM_ANDAMENTO" || vaga.initialBadge === "CANDIDATURA_ENVIADA") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          <Check className="size-3.5" />
          Candidatura enviada
        </span>
      )
    }

    if (vaga.initialBadge === "EM_ANALISE") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
          <Hourglass className="size-3.5" />
          Em análise
        </span>
      )
    }

    if (vaga.initialBadge === "NOVA") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-[#7c3aed]">
          <Sparkles className="size-3.5" />
          Nova
        </span>
      )
    }

    if (vaga.initialBadge === "SALVA" || saved) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
          <Bookmark className="size-3.5 fill-current" />
          Salva
        </span>
      )
    }

    return null
  }

  // Tags do card (Nível, Modalidade, Categoria)
  const nivelLabel = NIVEL_LABELS[vaga.nivelExperiencia] || "Pleno"
  const modalidadeLabel = MODALIDADE_LABELS[vaga.modalidade] || "Híbrido"
  const categoriaLabel = vaga.displayCategory || "Tecnologia"

  return (
    <article
      onClick={onSelect}
      className={cn(
        "group relative flex flex-col justify-between rounded-3xl border bg-white p-5 sm:p-6 shadow-xs transition-all duration-200 hover:shadow-md hover:border-slate-300/80 cursor-pointer",
        selected ? "border-[#7c3aed] ring-2 ring-[#7c3aed]/15" : "border-slate-200/80"
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        {/* Lado Esquerdo: Logo + Título + Badges + Metadados + Descrição */}
        <div className="flex items-start gap-4 min-w-0 flex-1">
          <CompanyBrandLogo
            company={company}
            variant={vaga.logoVariant}
            className="size-14 rounded-2xl shrink-0"
          />

          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {company}
            </p>
            <h3 className="mt-0.5 text-base font-bold text-slate-900 transition-colors group-hover:text-[#7c3aed] sm:text-lg">
              {vaga.titulo}
            </h3>

            {/* Tags Pills */}
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-600">
                {nivelLabel}
              </span>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-600">
                {modalidadeLabel}
              </span>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-600">
                {categoriaLabel}
              </span>
            </div>

            {/* Metadados: Localização, Salário, Data */}
            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500">
              <div className="flex items-center gap-1">
                <MapPin className="size-3.5 text-slate-400" />
                <span>{locationText}</span>
              </div>
              <div className="flex items-center gap-1">
                <Briefcase className="size-3.5 text-slate-400" />
                <span>{salaryText}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="size-3.5 text-slate-400" />
                <span>{relativeDateText}</span>
              </div>
            </div>

            {/* Descrição Preview limpa de tags HTML/Markdown */}
            {vaga.descricao && (
              <p className="mt-3 line-clamp-2 text-xs text-slate-500 leading-relaxed">
                {vaga.descricao
                  .replace(/<[^>]*>/g, " ")
                  .replace(/[#*_`~]/g, "")
                  .replace(/\s+/g, " ")
                  .trim()}
              </p>
            )}
          </div>
        </div>

        {/* Lado Direito: Bookmark, Status Badge, Facepile e Chevron */}
        <div className="flex flex-row items-center justify-between sm:flex-col sm:items-end sm:justify-between sm:self-stretch sm:pl-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onToggleSave()
              }}
              aria-label={saved ? "Remover dos salvos" : "Salvar vaga"}
              className="grid size-9 place-items-center rounded-full text-slate-400 transition-all hover:bg-slate-100 hover:text-[#7c3aed]"
            >
              <Bookmark className={cn("size-4", saved && "fill-current text-[#7c3aed]")} />
            </button>

            {renderStatusBadge()}
          </div>

          <div className="mt-auto flex items-center gap-3 pt-3">
            <ApplicantFacepile
              count={vaga.applicantsCount}
              timeText={vaga.relativeTimeText ? "há 6 dias" : undefined}
            />
            <ChevronRight className="size-4 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-slate-700" />
          </div>
        </div>
      </div>
    </article>
  )
}
