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

const SORT_OPTIONS: { value: JobSort; label: string }[] = [
  { value: "recent", label: "Mais recentes primeiro" },
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
    <fieldset className="border-t border-border-subtle px-4 py-4 sm:px-5">
      <legend className="sr-only">{title}</legend>
      <p aria-hidden className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      <div className="flex flex-col gap-2.5">{children}</div>
    </fieldset>
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
      className={cn("rounded-2xl border border-border bg-card shadow-card", className)}
    >
      <header className="flex items-center justify-between gap-2 px-4 py-3.5 sm:px-5 sm:py-4">
        <h2 className="flex items-center gap-2 text-sm font-bold text-foreground">
          <SlidersHorizontal className="size-4 text-primary" aria-hidden />
          Filtros de Vagas
        </h2>

        {activeCount > 0 && (
          <button
            type="button"
            onClick={() => onChange(EMPTY_FILTERS)}
            className="rounded-full border border-border px-2.5 py-0.5 text-xs font-semibold text-primary transition-colors hover:bg-primary-subtle"
          >
            Limpar tudo
          </button>
        )}
      </header>

      <Section title="Ordenar resultados">
        {SORT_OPTIONS.map((option) => (
          <label
            key={option.value}
            className="flex cursor-pointer items-center gap-2.5 text-xs sm:text-sm text-foreground transition-colors hover:text-primary"
          >
            <input
              type="radio"
              name="job-sort"
              checked={filters.sort === option.value}
              onChange={() => patch({ sort: option.value })}
              className="size-4 shrink-0 accent-primary"
            />
            <span>{option.label}</span>
          </label>
        ))}
      </Section>

      <Section title="Modalidade de trabalho">
        {MODALIDADES.map((modalidade) => (
          <label
            key={modalidade}
            className="flex cursor-pointer items-center justify-between gap-2 text-xs sm:text-sm text-foreground transition-colors hover:text-primary"
          >
            <div className="flex items-center gap-2.5">
              <input
                type="checkbox"
                checked={filters.modalidades.includes(modalidade)}
                onChange={() => patch({ modalidades: toggle(filters.modalidades, modalidade) })}
                className="size-4 shrink-0 rounded accent-primary"
              />
              <span>{MODALIDADE_LABELS[modalidade]}</span>
            </div>
          </label>
        ))}
      </Section>

      <fieldset className="border-t border-border-subtle px-4 py-3.5 sm:px-5 sm:py-4">
        <legend className="sr-only">Faixa salarial</legend>
        <div className="flex items-baseline justify-between gap-2">
          <p aria-hidden className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Salário a partir de
          </p>
          <span className="text-xs font-bold text-primary">
            {filters.salarioMin > 0 ? formatCurrency(filters.salarioMin) : "Qualquer valor"}
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

        <div className="mt-1.5 flex justify-between text-[10px] text-muted-foreground">
          <span>R$ 0</span>
          <span>{formatCurrency(SALARIO_MAX)}+</span>
        </div>
      </fieldset>

      <Section title="Nível de experiência">
        {NIVEIS.map((nivel) => {
          const meta = NIVEL_METADATA[nivel]
          const checked = filters.niveis.includes(nivel)
          return (
            <label
              key={nivel}
              className="flex cursor-pointer items-center justify-between gap-2 text-xs sm:text-sm text-foreground transition-colors hover:text-primary"
            >
              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => patch({ niveis: toggle(filters.niveis, nivel) })}
                  className="size-4 shrink-0 rounded accent-primary"
                />
                <span>{meta?.label ?? NIVEL_LABELS[nivel]}</span>
              </div>
              <span className={cn("rounded px-1.5 py-0.2 text-[10px] font-semibold border", meta?.bgStyle)}>
                {meta?.tag}
              </span>
            </label>
          )
        })}
      </Section>
    </section>
  )
}

