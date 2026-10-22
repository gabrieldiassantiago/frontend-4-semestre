"use client"

import {
  ArrowUpDown,
  Building2,
  Check,
  Crosshair,
  Globe,
  Laptop,
  Loader2,
  Navigation,
  RotateCcw,
  SlidersHorizontal,
  Wallet,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/format"
import { Modal } from "@/components/ui/modal"
import { MODALIDADE_LABELS, type VagaModalidade } from "@/lib/types/vaga.types"
import {
  EMPTY_FILTERS,
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
  isLoading?: boolean
  isProximityActive?: boolean
  raioKm?: number
  onChangeRaio?: (r: number) => void
  onToggleProximity?: () => void
  isLocating?: boolean
}

const MODALIDADES: { value: VagaModalidade; icon: typeof Building2; hint: string }[] = [
  { value: "PRESENCIAL", icon: Building2, hint: "No escritório" },
  { value: "HIBRIDO", icon: Laptop, hint: "Escritório + casa" },
  { value: "REMOTO", icon: Globe, hint: "De qualquer lugar" },
]

const SALARY_PRESETS = [0, 3000, 5000, 8000, 12000]

function FilterSection({
  icon: Icon,
  title,
  aside,
  children,
}: {
  icon: typeof Building2
  title: string
  aside?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-3 border-b border-border-subtle py-5 first:pt-0 last:border-0 last:pb-0">
      <div className="flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Icon className="size-4 text-muted-foreground" aria-hidden />
          {title}
        </h3>
        {aside}
      </div>
      {children}
    </section>
  )
}

/**
 * Filtros avançados. As mudanças são aplicadas na hora (a lista atualiza
 * por trás do modal), então o rodapé só mostra o resultado e fecha.
 */
export function JobFiltersModal({
  open,
  onClose,
  filters,
  onChange,
  totalCount,
  isLoading = false,
  isProximityActive = false,
  raioKm = 25,
  onChangeRaio,
  onToggleProximity,
  isLocating = false,
}: JobFiltersModalProps) {
  const patch = (partial: Partial<JobFiltersState>) => onChange({ ...filters, ...partial })

  const toggleModalidade = (modalidade: VagaModalidade) => {
    const list = filters.modalidades.includes(modalidade)
      ? filters.modalidades.filter((m) => m !== modalidade)
      : [...filters.modalidades, modalidade]
    patch({ modalidades: list })
  }

  const activeCount = countActiveFilters(filters) + (isProximityActive ? 1 : 0)
  const resultLabel = `${totalCount} ${totalCount === 1 ? "vaga" : "vagas"}`

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Filtros"
      description="Os resultados são atualizados automaticamente."
      icon={SlidersHorizontal}
      size="lg"
      headerActions={
        activeCount > 0 ? (
          <button
            type="button"
            onClick={() => {
              onChange(EMPTY_FILTERS)
              if (isProximityActive) onToggleProximity?.()
            }}
            className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <RotateCcw className="size-3.5" aria-hidden />
            <span className="hidden sm:inline">Limpar</span>
            <span className="sr-only sm:hidden">Limpar filtros</span>
          </button>
        ) : null
      }
      footerStart={
        <span aria-live="polite" className="flex items-center gap-2">
          {isLoading && <Loader2 className="size-3.5 animate-spin text-primary" aria-hidden />}
          <span>
            <strong className="font-semibold text-foreground">{resultLabel}</strong> com os filtros atuais
          </span>
        </span>
      }
      footer={
        <button type="button" onClick={onClose} className="btn-primary">
          {isLoading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Check className="size-4" aria-hidden />}
          Ver {resultLabel}
        </button>
      }
    >
      <FilterSection icon={ArrowUpDown} title="Ordenar por">
        <div role="radiogroup" aria-label="Ordenação" className="grid grid-cols-1 gap-1 rounded-xl bg-surface p-1 sm:grid-cols-3">
          {SORT_OPTIONS.map((opt) => {
            const selected = filters.sort === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => patch({ sort: opt.value as JobSort })}
                className={cn(
                  "h-9 rounded-lg px-3 text-sm font-medium transition-all",
                  selected
                    ? "bg-card text-foreground shadow-card ring-1 ring-border"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
      </FilterSection>

      <FilterSection
        icon={Building2}
        title="Modalidade"
        aside={
          filters.modalidades.length > 0 ? (
            <span className="text-xs font-medium text-muted-foreground">
              {filters.modalidades.length} selecionada{filters.modalidades.length > 1 ? "s" : ""}
            </span>
          ) : null
        }
      >
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {MODALIDADES.map(({ value, icon: Icon, hint }) => {
            const selected = filters.modalidades.includes(value)
            return (
              <button
                key={value}
                type="button"
                role="checkbox"
                aria-checked={selected}
                onClick={() => toggleModalidade(value)}
                className={cn(
                  "flex items-center gap-3 rounded-xl border p-3 text-left transition-colors",
                  selected
                    ? "border-primary bg-primary-subtle"
                    : "border-border bg-card hover:border-border-strong hover:bg-surface",
                )}
              >
                <span
                  className={cn(
                    "grid size-9 shrink-0 place-items-center rounded-lg transition-colors",
                    selected ? "bg-primary text-primary-foreground" : "bg-surface text-muted-foreground",
                  )}
                >
                  <Icon className="size-4" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-foreground">{MODALIDADE_LABELS[value]}</span>
                  <span className="block truncate text-xs text-muted-foreground">{hint}</span>
                </span>
                <span
                  aria-hidden
                  className={cn(
                    "grid size-5 shrink-0 place-items-center rounded-md border transition-colors",
                    selected ? "border-primary bg-primary text-primary-foreground" : "border-border-strong",
                  )}
                >
                  {selected && <Check className="size-3.5" />}
                </span>
              </button>
            )
          })}
        </div>
      </FilterSection>

      <FilterSection
        icon={Wallet}
        title="Salário mínimo"
        aside={
          <span className="text-sm font-semibold tabular-nums text-foreground">
            {filters.salarioMin > 0 ? `${formatCurrency(filters.salarioMin)}/mês` : "Qualquer valor"}
          </span>
        }
      >
        <input
          type="range"
          min={0}
          max={SALARIO_MAX}
          step={500}
          value={filters.salarioMin}
          onChange={(e) => patch({ salarioMin: Number(e.target.value) })}
          aria-label="Salário mínimo"
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-border accent-primary"
        />
        <div className="flex flex-wrap gap-1.5">
          {SALARY_PRESETS.map((value) => {
            const active = filters.salarioMin === value
            return (
              <button
                key={value}
                type="button"
                onClick={() => patch({ salarioMin: value })}
                aria-pressed={active}
                className={cn(
                  "h-8 rounded-full border px-3 text-xs font-medium transition-colors",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:border-border-strong hover:text-foreground",
                )}
              >
                {value === 0 ? "Qualquer" : `${formatCurrency(value)}+`}
              </button>
            )
          })}
        </div>
      </FilterSection>

      {onToggleProximity && (
        <FilterSection icon={Crosshair} title="Perto de mim">
          <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
              {isProximityActive
                ? "Mostrando vagas próximas da sua localização atual."
                : "Use sua localização para ver vagas próximas, ordenadas por distância."}
            </p>
            <button
              type="button"
              onClick={onToggleProximity}
              disabled={isLocating}
              aria-pressed={isProximityActive}
              className={cn("shrink-0", isProximityActive ? "btn-secondary" : "btn-primary")}
            >
              {isLocating ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <Navigation className="size-4" aria-hidden />
              )}
              {isLocating ? "Localizando..." : isProximityActive ? "Desativar" : "Usar localização"}
            </button>
          </div>

          {isProximityActive && onChangeRaio && (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm text-muted-foreground">Raio máximo</span>
              <div className="flex flex-wrap gap-1.5">
                {RADII_OPTIONS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => onChangeRaio(r)}
                    aria-pressed={raioKm === r}
                    className={cn(
                      "h-8 rounded-full border px-3 text-xs font-medium transition-colors",
                      raioKm === r
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-muted-foreground hover:border-border-strong hover:text-foreground",
                    )}
                  >
                    {r} km
                  </button>
                ))}
              </div>
            </div>
          )}
        </FilterSection>
      )}
    </Modal>
  )
}
