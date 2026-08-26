"use client"

import { SlidersHorizontal } from "lucide-react"
import { formatCurrency } from "@/lib/format"
import { cn } from "@/lib/utils"
import {
  MODALIDADE_LABELS,
  NIVEL_LABELS,
  type NivelExperiencia,
  type VagaModalidade,
} from "@/lib/types/vaga.types"

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

const SORT_OPTIONS: { value: JobSort; label: string }[] = [
  { value: "recent", label: "Mais recentes" },
  { value: "salary-desc", label: "Maior salário" },
  { value: "salary-asc", label: "Menor salário" },
]

const MODALIDADES = Object.keys(MODALIDADE_LABELS) as VagaModalidade[]
const NIVEIS = Object.keys(NIVEL_LABELS) as NivelExperiencia[]

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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="border-t border-border-subtle px-5 py-4">
      <legend className="sr-only">{title}</legend>
      <p aria-hidden className="mb-3 text-sm font-bold text-foreground">
        {title}
      </p>
      <div className="flex flex-col gap-2.5">{children}</div>
    </fieldset>
  )
}

function Option({
  type,
  name,
  label,
  checked,
  onChange,
}: {
  type: "radio" | "checkbox"
  name?: string
  label: string
  checked: boolean
  onChange: () => void
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm text-strong-foreground transition-colors hover:text-foreground">
      <input
        type={type}
        name={name}
        checked={checked}
        onChange={onChange}
        className={cn(
          "size-4 shrink-0 accent-primary",
          type === "checkbox" ? "rounded" : "rounded-full",
        )}
      />
      <span className="min-w-0">{label}</span>
    </label>
  )
}

export function JobFiltersPanel({
  filters,
  onChange,
  className,
}: {
  filters: JobFiltersState
  onChange: (next: JobFiltersState) => void
  className?: string
}) {
  const activeCount = countActiveFilters(filters)

  const patch = (partial: Partial<JobFiltersState>) => onChange({ ...filters, ...partial })

  return (
    <section
      aria-label="Filtrar vagas"
      className={cn("rounded-panel border border-border bg-card shadow-card", className)}
    >
      <header className="flex items-center justify-between gap-2 px-5 py-4">
        <h2 className="flex items-center gap-2 text-sm font-bold text-foreground">
          <SlidersHorizontal className="size-4 text-primary" aria-hidden />
          Filtros
        </h2>

        {activeCount > 0 && (
          <button
            type="button"
            onClick={() => onChange(EMPTY_FILTERS)}
            className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary-subtle"
          >
            Limpar
          </button>
        )}
      </header>

      <Section title="Ordenar por">
        {SORT_OPTIONS.map((option) => (
          <Option
            key={option.value}
            type="radio"
            name="job-sort"
            label={option.label}
            checked={filters.sort === option.value}
            onChange={() => patch({ sort: option.value })}
          />
        ))}
      </Section>

      <Section title="Modalidade">
        {MODALIDADES.map((modalidade) => (
          <Option
            key={modalidade}
            type="checkbox"
            label={MODALIDADE_LABELS[modalidade]}
            checked={filters.modalidades.includes(modalidade)}
            onChange={() => patch({ modalidades: toggle(filters.modalidades, modalidade) })}
          />
        ))}
      </Section>

      <fieldset className="border-t border-border-subtle px-5 py-4">
        <legend className="sr-only">Salário mínimo</legend>
        <div className="flex items-baseline justify-between gap-2">
          <p aria-hidden className="text-sm font-bold text-foreground">
            Salário mínimo
          </p>
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
          onChange={(event) => patch({ salarioMin: Number(event.target.value) })}
          aria-label="Salário mínimo"
          aria-valuetext={
            filters.salarioMin > 0 ? formatCurrency(filters.salarioMin) : "Qualquer salário"
          }
          className="mt-3 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-border accent-primary"
        />

        <div className="mt-1.5 flex justify-between text-[11px] text-subtle-foreground">
          <span>R$ 0</span>
          <span>{formatCurrency(SALARIO_MAX)}+</span>
        </div>
      </fieldset>

      <Section title="Nível de experiência">
        {NIVEIS.map((nivel) => (
          <Option
            key={nivel}
            type="checkbox"
            label={NIVEL_LABELS[nivel]}
            checked={filters.niveis.includes(nivel)}
            onChange={() => patch({ niveis: toggle(filters.niveis, nivel) })}
          />
        ))}
      </Section>
    </section>
  )
}
