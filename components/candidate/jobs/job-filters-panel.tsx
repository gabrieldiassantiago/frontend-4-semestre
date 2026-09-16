"use client"

import { useState } from "react"
import {
  SlidersHorizontal,
  ArrowUpDown,
  Building2,
  Laptop,
  Globe,
  DollarSign,
  Briefcase,
  Maximize2,
  RotateCcw,
  Check,
  ChevronDown,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { formatCurrency } from "@/lib/format"
import { cn } from "@/lib/utils"
import {
  MODALIDADE_LABELS,
  NIVEL_LABELS,
  type NivelExperiencia,
  type VagaModalidade,
} from "@/lib/types/vaga.types"
import { NIVEL_METADATA } from "@/lib/constants/vaga-categories"

export type JobSort = "recent" | "salary-desc" | "salary-asc"

export interface JobFiltersState {
  sort: JobSort
  modalidades: VagaModalidade[]
  niveis: NivelExperiencia[]
  salarioMin: number
}

export const EMPTY_FILTERS: JobFiltersState = {
  sort: "recent",
  modalidades: [],
  niveis: [],
  salarioMin: 0,
}

export const SALARIO_MAX = 30_000

export const SORT_OPTIONS: { value: JobSort; label: string }[] = [
  { value: "recent", label: "Mais recentes" },
  { value: "salary-desc", label: "Maior salário" },
  { value: "salary-asc", label: "Menor salário" },
]

const MODALIDADE_ITEMS: { value: VagaModalidade; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: "PRESENCIAL", label: "Presencial", icon: Building2 },
  { value: "HIBRIDO", label: "Híbrido", icon: Laptop },
  { value: "REMOTO", label: "Remoto", icon: Globe },
]

const NIVEIS = Object.keys(NIVEL_LABELS) as NivelExperiencia[]

const QUICK_SALARY_PRESETS = [0, 3000, 5000, 8000, 12000]

/** Quantos filtros o usuário aplicou (a ordenação padrão não conta). */
export function countActiveFilters(filters: JobFiltersState) {
  return (
    filters.modalidades.length +
    filters.niveis.length +
    (filters.salarioMin > 0 ? 1 : 0) +
    (filters.sort !== "recent" ? 1 : 0)
  )
}

/** Alterna um valor dentro de uma lista de filtros. */
function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value]
}

export function JobFiltersPanel({
  filters,
  onChange,
  onOpenModal,
  className,
}: {
  filters: JobFiltersState
  onChange: (next: JobFiltersState) => void
  onOpenModal?: () => void
  className?: string
}) {
  const activeCount = countActiveFilters(filters)
  const patch = (partial: Partial<JobFiltersState>) => onChange({ ...filters, ...partial })

  return (
    <motion.section
      aria-label="Filtrar vagas"
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={cn(
        "rounded-3xl border border-border/80 bg-card/95 backdrop-blur-md shadow-card overflow-hidden",
        className
      )}
    >
      {/* Header com visual moderno */}
      <header className="flex items-center justify-between gap-2 border-b border-border-subtle bg-gradient-to-r from-card via-surface to-card px-4 py-3.5 sm:px-5">
        <div className="flex items-center gap-2">
          <div className="grid size-7 place-items-center rounded-lg bg-primary-subtle text-primary shadow-xs">
            <SlidersHorizontal className="size-3.5" aria-hidden />
          </div>
          <h2 className="text-sm font-bold tracking-tight text-foreground">
            Filtros
          </h2>
          <AnimatePresence>
            {activeCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="grid size-5 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-xs"
              >
                {activeCount}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-1.5">
          {activeCount > 0 && (
            <motion.button
              type="button"
              whileTap={{ scale: 0.94 }}
              onClick={() => onChange(EMPTY_FILTERS)}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-2.5 py-1 text-[11px] font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <RotateCcw className="size-2.5" />
              Limpar
            </motion.button>
          )}

          {onOpenModal && (
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.94 }}
              onClick={onOpenModal}
              title="Abrir painel completo de filtros em modal"
              className="grid size-7 place-items-center rounded-lg border border-border bg-surface text-muted-foreground hover:bg-primary-subtle hover:text-primary transition-colors"
            >
              <Maximize2 className="size-3.5" />
            </motion.button>
          )}
        </div>
      </header>

      <div className="divide-y divide-border-subtle">
        {/* 1. Ordenação */}
        <div className="p-4 sm:p-5">
          <div className="mb-2.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <ArrowUpDown className="size-3 text-primary" />
            <span>Ordenar</span>
          </div>

          <div className="space-y-1">
            {SORT_OPTIONS.map((option) => {
              const isSelected = filters.sort === option.value
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => patch({ sort: option.value })}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left text-xs sm:text-sm transition-all",
                    isSelected
                      ? "bg-primary-subtle font-bold text-primary shadow-xs"
                      : "text-foreground hover:bg-muted font-medium"
                  )}
                >
                  <span>{option.label}</span>
                  {isSelected && <Check className="size-3.5 text-primary" />}
                </button>
              )
            })}
          </div>
        </div>

        {/* 2. Modalidade */}
        <div className="p-4 sm:p-5">
          <div className="mb-2.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <Building2 className="size-3 text-primary" />
            <span>Modalidade</span>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {MODALIDADE_ITEMS.map(({ value, label, icon: Icon }) => {
              const isSelected = filters.modalidades.includes(value)
              return (
                <motion.button
                  key={value}
                  type="button"
                  whileTap={{ scale: 0.94 }}
                  onClick={() => patch({ modalidades: toggle(filters.modalidades, value) })}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-xl border p-2 text-center transition-all",
                    isSelected
                      ? "border-primary bg-primary-subtle text-primary font-bold shadow-xs ring-1 ring-primary/20"
                      : "border-border bg-surface text-muted-foreground hover:bg-muted hover:text-foreground font-medium"
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  <span className="text-[11px] leading-tight">{label}</span>
                </motion.button>
              )
            })}
          </div>
        </div>

        {/* 3. Salário Mínimo */}
        <div className="p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <DollarSign className="size-3 text-primary" />
              <span>Salário Mínimo</span>
            </div>
            <span className="text-xs font-bold text-primary">
              {filters.salarioMin > 0 ? formatCurrency(filters.salarioMin) : "Qualquer"}
            </span>
          </div>

          <input
            type="range"
            min={0}
            max={SALARIO_MAX}
            step={500}
            value={filters.salarioMin}
            onChange={(e) => patch({ salarioMin: Number(e.target.value) })}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-border accent-primary"
          />

          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>R$ 0</span>
            <span>{formatCurrency(SALARIO_MAX)}+</span>
          </div>

          {/* Chips rápidos de salário */}
          <div className="flex flex-wrap gap-1 pt-1">
            {QUICK_SALARY_PRESETS.map((val) => {
              const active = filters.salarioMin === val
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => patch({ salarioMin: val })}
                  className={cn(
                    "rounded-lg px-2 py-0.5 text-[11px] font-semibold transition-all",
                    active
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "bg-surface border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {val === 0 ? "Todos" : `${formatCurrency(val)}+`}
                </button>
              )
            })}
          </div>
        </div>

        {/* 4. Nível de Experiência */}
        <div className="p-4 sm:p-5">
          <div className="mb-2.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <Briefcase className="size-3 text-primary" />
            <span>Nível</span>
          </div>

          <div className="space-y-1">
            {NIVEIS.map((nivel) => {
              const isSelected = filters.niveis.includes(nivel)
              const meta = NIVEL_METADATA[nivel]
              return (
                <button
                  key={nivel}
                  type="button"
                  onClick={() => patch({ niveis: toggle(filters.niveis, nivel) })}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-left text-xs transition-all",
                    isSelected
                      ? "bg-primary-subtle text-primary font-bold shadow-xs"
                      : "text-foreground hover:bg-muted font-medium"
                  )}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className={cn(
                        "grid size-4 place-items-center rounded border transition-colors",
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card"
                      )}
                    >
                      {isSelected && <Check className="size-3" />}
                    </span>
                    <span className="truncate">{NIVEL_LABELS[nivel]}</span>
                  </div>

                  <span
                    className={cn(
                      "rounded px-1.5 py-0.2 text-[10px] font-bold border",
                      meta?.bgStyle
                    )}
                  >
                    {meta?.tag}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Botão para abrir modal expandido */}
        {onOpenModal && (
          <div className="p-3 bg-surface/50 text-center">
            <button
              type="button"
              onClick={onOpenModal}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline py-1"
            >
              <SlidersHorizontal className="size-3.5" />
              Abrir filtros avançados
            </button>
          </div>
        )}
      </div>
    </motion.section>
  )
}
