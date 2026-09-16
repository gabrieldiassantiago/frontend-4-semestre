"use client"

import { useState } from "react"
import {
  SlidersHorizontal,
  RotateCcw,
  Check,
  Building2,
  Laptop,
  Globe,
  DollarSign,
  Briefcase,
  Crosshair,
  ArrowUpDown,
  Navigation,
  Loader2,
  X,
  Sparkles,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/format"
import {
  MODALIDADE_LABELS,
  NIVEL_LABELS,
  type NivelExperiencia,
  type VagaModalidade,
} from "@/lib/types/vaga.types"
import { NIVEL_METADATA } from "@/lib/constants/vaga-categories"
import {
  SALARIO_MAX,
  SORT_OPTIONS,
  countActiveFilters,
  type JobFiltersState,
  type JobSort,
} from "./job-filters-panel"
import { RADII_OPTIONS } from "./proximity-banner"

interface JobFiltersModalProps {
  open: boolean
  onClose: () => void
  filters: JobFiltersState
  onChange: (next: JobFiltersState) => void
  totalCount: number
  isProximityActive?: boolean
  raioKm?: number
  onChangeRaio?: (r: number) => void
  onToggleProximity?: () => void
  isLocating?: boolean
}

const MODALIDADE_ICONS: Record<VagaModalidade, React.ComponentType<{ className?: string }>> = {
  PRESENCIAL: Building2,
  HIBRIDO: Laptop,
  REMOTO: Globe,
}

const SALARY_PRESETS = [0, 3000, 5000, 8000, 12000, 15000]

export function JobFiltersModal({
  open,
  onClose,
  filters,
  onChange,
  totalCount,
  isProximityActive = false,
  raioKm = 25,
  onChangeRaio,
  onToggleProximity,
  isLocating = false,
}: JobFiltersModalProps) {
  const [localFilters, setLocalFilters] = useState<JobFiltersState>(filters)

  // Sincroniza sempre que abrir
  const handleOpen = () => {
    setLocalFilters(filters)
  }

  const patch = (partial: Partial<JobFiltersState>) => {
    const next = { ...localFilters, ...partial }
    setLocalFilters(next)
    onChange(next)
  }

  const toggleModalidade = (modalidade: VagaModalidade) => {
    const list = localFilters.modalidades.includes(modalidade)
      ? localFilters.modalidades.filter((m) => m !== modalidade)
      : [...localFilters.modalidades, modalidade]
    patch({ modalidades: list })
  }

  const toggleNivel = (nivel: NivelExperiencia) => {
    const list = localFilters.niveis.includes(nivel)
      ? localFilters.niveis.filter((n) => n !== nivel)
      : [...localFilters.niveis, nivel]
    patch({ niveis: list })
  }

  const handleReset = () => {
    const resetState: JobFiltersState = {
      sort: "recent",
      modalidades: [],
      niveis: [],
      salarioMin: 0,
    }
    setLocalFilters(resetState)
    onChange(resetState)
  }

  const activeCount = countActiveFilters(localFilters) + (isProximityActive ? 1 : 0)

  return (
    <AnimatePresence onExitComplete={handleOpen}>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
          {/* Backdrop escuro com blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Filtros avançados de vagas"
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-[2rem] border border-border bg-card shadow-2xl sm:rounded-[2rem]"
          >
            {/* Header com gradiente sutil */}
            <header className="flex items-center justify-between border-b border-border bg-gradient-to-r from-card via-surface to-card px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-xl bg-primary-subtle text-primary shadow-xs">
                  <SlidersHorizontal className="size-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold tracking-tight text-foreground">
                      Filtros de Vagas
                    </h2>
                    {activeCount > 0 && (
                      <span className="grid size-5 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                        {activeCount}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Ajuste os critérios para encontrar a oportunidade perfeita
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {activeCount > 0 && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <RotateCcw className="size-3" />
                    Limpar
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Fechar filtros"
                  className="grid size-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              </div>
            </header>

            {/* Conteúdo com scroll */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* 1. Ordenação dos Resultados */}
              <section className="space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <ArrowUpDown className="size-3.5 text-primary" />
                  <span>Ordenar Resultados</span>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {SORT_OPTIONS.map((opt) => {
                    const isSelected = localFilters.sort === opt.value
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => patch({ sort: opt.value as JobSort })}
                        className={cn(
                          "flex items-center justify-between rounded-xl border p-3 text-left transition-all",
                          isSelected
                            ? "border-primary bg-primary-subtle/80 text-primary-subtle-foreground font-bold shadow-xs ring-1 ring-primary/30"
                            : "border-border bg-surface text-foreground hover:bg-muted hover:border-border-strong font-medium"
                        )}
                      >
                        <span className="text-xs sm:text-sm truncate">{opt.label}</span>
                        {isSelected && <Check className="size-4 shrink-0 text-primary" />}
                      </button>
                    )
                  })}
                </div>
              </section>

              {/* 2. Modalidade de Trabalho */}
              <section className="space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <Building2 className="size-3.5 text-primary" />
                  <span>Modalidade de Trabalho</span>
                </div>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                  {(["PRESENCIAL", "HIBRIDO", "REMOTO"] as VagaModalidade[]).map((m) => {
                    const Icon = MODALIDADE_ICONS[m]
                    const isSelected = localFilters.modalidades.includes(m)
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => toggleModalidade(m)}
                        className={cn(
                          "flex flex-col items-start gap-1 rounded-2xl border p-3.5 text-left transition-all",
                          isSelected
                            ? "border-primary bg-primary-subtle/70 text-primary-subtle-foreground shadow-xs ring-2 ring-primary/20"
                            : "border-border bg-surface text-foreground hover:border-border-strong hover:bg-muted"
                        )}
                      >
                        <div className="flex w-full items-center justify-between">
                          <span
                            className={cn(
                              "grid size-8 place-items-center rounded-xl transition-colors",
                              isSelected
                                ? "bg-primary text-primary-foreground"
                                : "bg-card text-muted-foreground border border-border"
                            )}
                          >
                            <Icon className="size-4" />
                          </span>
                          {isSelected && <Check className="size-4 text-primary" />}
                        </div>
                        <span className="mt-2 text-sm font-bold">{MODALIDADE_LABELS[m]}</span>
                        <span className="text-[11px] text-muted-foreground">
                          {m === "REMOTO"
                            ? "Trabalhe de qualquer lugar"
                            : m === "HIBRIDO"
                            ? "Presencial + home office"
                            : "Atuação no escritório"}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </section>

              {/* 3. Faixa Salarial */}
              <section className="space-y-3 rounded-2xl border border-border bg-surface/60 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <DollarSign className="size-3.5 text-primary" />
                    <span>Salário Mínimo Desejado</span>
                  </div>
                  <span className="text-sm font-bold text-primary">
                    {localFilters.salarioMin > 0
                      ? `${formatCurrency(localFilters.salarioMin)} /mês`
                      : "Sem salário mínimo"}
                  </span>
                </div>

                <input
                  type="range"
                  min={0}
                  max={SALARIO_MAX}
                  step={500}
                  value={localFilters.salarioMin}
                  onChange={(e) => patch({ salarioMin: Number(e.target.value) })}
                  className="h-2 w-full cursor-pointer appearance-none rounded-full bg-border accent-primary"
                />

                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Qualquer valor</span>
                  <span>{formatCurrency(SALARIO_MAX)}+</span>
                </div>

                {/* Presets rápidos de salário */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {SALARY_PRESETS.map((p) => {
                    const active = localFilters.salarioMin === p
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => patch({ salarioMin: p })}
                        className={cn(
                          "rounded-lg px-2.5 py-1 text-xs font-semibold transition-all",
                          active
                            ? "bg-primary text-primary-foreground shadow-xs"
                            : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                        )}
                      >
                        {p === 0 ? "Todos" : `${formatCurrency(p)}+`}
                      </button>
                    )
                  })}
                </div>
              </section>

              {/* 4. Nível de Experiência */}
              <section className="space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <Briefcase className="size-3.5 text-primary" />
                  <span>Nível de Experiência</span>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {(
                    [
                      "ESTAGIO",
                      "JUNIOR",
                      "PLENO",
                      "SENIOR",
                      "ESPECIALISTA",
                      "LIDERANCA",
                    ] as NivelExperiencia[]
                  ).map((nivel) => {
                    const isSelected = localFilters.niveis.includes(nivel)
                    const meta = NIVEL_METADATA[nivel]
                    return (
                      <button
                        key={nivel}
                        type="button"
                        onClick={() => toggleNivel(nivel)}
                        className={cn(
                          "flex items-center justify-between rounded-xl border p-2.5 text-left transition-all",
                          isSelected
                            ? "border-primary bg-primary-subtle/80 text-primary-subtle-foreground font-bold ring-1 ring-primary/30"
                            : "border-border bg-surface text-foreground hover:bg-muted hover:border-border-strong font-medium"
                        )}
                      >
                        <div className="truncate">
                          <p className="text-xs sm:text-sm font-semibold truncate">
                            {NIVEL_LABELS[nivel]}
                          </p>
                          <span
                            className={cn(
                              "inline-block rounded px-1.5 py-0.2 text-[10px] font-bold border mt-0.5",
                              meta?.bgStyle
                            )}
                          >
                            {meta?.tag}
                          </span>
                        </div>
                        {isSelected && <Check className="size-4 shrink-0 text-primary ml-1" />}
                      </button>
                    )
                  })}
                </div>
              </section>

              {/* 5. Proximidade Geográfica */}
              {onToggleProximity && (
                <section className="space-y-3 rounded-2xl border border-border bg-surface/50 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Crosshair className="size-4 text-primary" />
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-strong-foreground">
                          Busca por Proximidade (GPS)
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Encontre vagas perto de onde você está agora
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={onToggleProximity}
                      disabled={isLocating}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all",
                        isProximityActive
                          ? "bg-primary text-primary-foreground shadow-xs"
                          : "border border-border bg-card text-strong-foreground hover:bg-muted"
                      )}
                    >
                      {isLocating ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Navigation className="size-3.5" />
                      )}
                      <span>{isProximityActive ? "Ativo" : "Ativar GPS"}</span>
                    </button>
                  </div>

                  {isProximityActive && onChangeRaio && (
                    <div className="pt-2 border-t border-border flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted-foreground">
                        Raio de distância máxima:
                      </span>
                      <div className="flex items-center gap-1">
                        {RADII_OPTIONS.map((r) => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => onChangeRaio(r)}
                            className={cn(
                              "rounded-lg px-2.5 py-1 text-xs font-bold transition-all",
                              raioKm === r
                                ? "bg-primary text-primary-foreground shadow-xs"
                                : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                            )}
                          >
                            {r} km
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </section>
              )}
            </div>

            {/* Footer com botão de ação e contagem de vagas */}
            <footer className="flex items-center justify-between gap-3 border-t border-border bg-surface px-6 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <div className="text-xs text-muted-foreground">
                <strong className="font-bold text-foreground">{totalCount}</strong> vagas encontradas
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-border bg-card px-4 py-2.5 text-xs sm:text-sm font-semibold text-strong-foreground transition-colors hover:bg-muted"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs sm:text-sm font-bold text-primary-foreground shadow-[0_4px_14px_rgba(124,58,237,0.3)] transition-colors hover:bg-primary-hover"
                >
                  <Sparkles className="size-4" />
                  Ver vagas ({totalCount})
                </button>
              </div>
            </footer>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
