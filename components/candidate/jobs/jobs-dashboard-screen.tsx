"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { RefreshCw, SearchX, SlidersHorizontal } from "lucide-react"
import { PageShell } from "@/components/ui/page"
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/states"
import { Sheet } from "@/components/ui/sheet"
import { ApplyModal } from "@/components/candidatura/apply-modal"
import { useCandidaturasPorVaga } from "@/lib/hooks/useCandidaturas"
import { useVagas } from "@/lib/hooks/useVagas"
import { CATEGORIA_LABELS } from "@/lib/types/vaga.types"
import type { Vaga } from "@/lib/types/vaga.types"
import { JobCard } from "./job-card"
import { JobDetailPanel } from "./job-detail-panel"
import { JobSearchBar, EMPTY_SEARCH, type JobSearchState } from "./job-search-bar"
import {
  JobFiltersPanel,
  EMPTY_FILTERS,
  countActiveFilters,
  type JobFiltersState,
} from "./job-filters-panel"

function JobCardSkeleton() {
  return (
    <div className="rounded-card border border-border bg-card p-5">
      <div className="flex items-start gap-3">
        <Skeleton className="size-11 rounded-xl" />
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-4 w-40" />
        </div>
      </div>
      <div className="mt-4 flex gap-1.5">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>
      <Skeleton className="mt-4 h-3 w-1/2" />
      <div className="mt-5 flex items-center justify-between border-t border-border-subtle pt-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  )
}

/** Ordena conforme o filtro escolhido. */
function sortVagas(vagas: Vaga[], sort: JobFiltersState["sort"]) {
  return [...vagas].sort((a, b) => {
    if (sort === "salary-desc") return b.salario - a.salario
    if (sort === "salary-asc") return a.salario - b.salario
    return new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
  })
}

export function JobsDashboardScreen() {
  const [search, setSearch] = useState<JobSearchState>(EMPTY_SEARCH)
  const [filters, setFilters] = useState<JobFiltersState>(EMPTY_FILTERS)
  const [savedIds, setSavedIds] = useState<string[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [applyVagaId, setApplyVagaId] = useState<string | null>(null)

  const { vagas, loading, error, refetch } = useVagas()
  const { porVaga: candidaturasPorVaga } = useCandidaturasPorVaga()

  // Deep link das páginas públicas: /dashboard?vaga=<id> abre a vaga já pronta
  // para candidatura, preservando a intenção de quem clicou lá fora.
  const searchParams = useSearchParams()
  const vagaParam = searchParams.get("vaga")

  useEffect(() => {
    if (!vagaParam || vagas.length === 0) return
    if (!vagas.some((vaga) => vaga.id === vagaParam)) return
    setSelectedId(vagaParam)
  }, [vagaParam, vagas])

  const results = useMemo(() => {
    const term = search.query.trim().toLowerCase()
    const outro = search.outro.trim().toLowerCase()
    const cidade = search.cidade.trim().toLowerCase()
    const estado = search.estado.trim().toLowerCase()

    const matched = vagas.filter((vaga) => {
      if (!vaga.ativa) return false

      const matchesTerm =
        !term ||
        vaga.titulo.toLowerCase().includes(term) ||
        (vaga.companyName ?? "").toLowerCase().includes(term) ||
        CATEGORIA_LABELS[vaga.categoria].toLowerCase().includes(term)

      const matchesOutro =
        search.categoria !== "OUTRO" ||
        !outro ||
        [vaga.titulo, vaga.companyName, vaga.descricao, vaga.beneficios]
          .filter(Boolean)
          .some((field) => field!.toLowerCase().includes(outro))

      const matchesCidade = !cidade || vaga.cidade.toLowerCase() === cidade
      const matchesEstado = !estado || vaga.estado.toLowerCase() === estado

      const matchesCategoria = search.categoria === "TODAS" || vaga.categoria === search.categoria

      const matchesModalidade =
        filters.modalidades.length === 0 || filters.modalidades.includes(vaga.modalidade)

      const matchesNivel =
        filters.niveis.length === 0 || filters.niveis.includes(vaga.nivelExperiencia)

      const matchesSalario = filters.salarioMin === 0 || vaga.salario >= filters.salarioMin

      return (
        matchesTerm &&
          matchesOutro &&
        matchesCidade &&
        matchesEstado &&
        matchesCategoria &&
        matchesModalidade &&
        matchesNivel &&
        matchesSalario
      )
    })

    return sortVagas(matched, filters.sort)
  }, [vagas, search, filters])

  // Mantém a seleção válida: se a vaga escolhida sai da lista, seleciona a primeira.
  useEffect(() => {
    if (results.length === 0) {
      setSelectedId(null)
      return
    }
    setSelectedId((current) =>
      current && results.some((vaga) => vaga.id === current) ? current : results[0].id,
    )
  }, [results])

  const selected = results.find((vaga) => vaga.id === selectedId) ?? null
  const applyVaga = vagas.find((vaga) => vaga.id === applyVagaId) ?? null
  const activeFilterCount = countActiveFilters(filters)

  const toggleSave = (id: string) =>
    setSavedIds((ids) => (ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]))

  const selectVaga = (id: string) => {
    setSelectedId(id)
    setDetailOpen(true)
  }

  const resetAll = () => {
    setSearch(EMPTY_SEARCH)
    setFilters(EMPTY_FILTERS)
  }

  const filtersPanel = (
    <JobFiltersPanel filters={filters} onChange={setFilters} />
  )

  return (
    <PageShell className="max-w-[1560px]">
      <header className="flex flex-col gap-1">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">Oportunidades</p>
        <h1 className="text-2xl font-bold tracking-tight text-foreground text-balance sm:text-3xl">
          Encontre uma vaga para você
        </h1>
      </header>

      <div className="mt-6">
        <JobSearchBar
          value={search}
          onSubmit={setSearch}
          onOpenFilters={() => setFiltersOpen(true)}
          activeFilterCount={activeFilterCount}
        />
      </div>

      <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-start">
        {/* Filtros: coluna fixa no desktop, gaveta no mobile */}
        <div className="hidden w-64 shrink-0 lg:sticky lg:top-24 lg:block">{filtersPanel}</div>

        <div className="min-w-0 flex-1">
          {!loading && !error && (
            <div className="mb-4 flex items-center justify-between gap-3">
              <p aria-live="polite" className="text-sm text-muted-foreground">
                <strong className="font-semibold text-foreground">{results.length}</strong>{" "}
                {results.length === 1 ? "vaga encontrada" : "vagas encontradas"}
              </p>

              <button
                type="button"
                onClick={() => setFiltersOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-strong-foreground transition-colors hover:bg-muted lg:hidden"
              >
                <SlidersHorizontal className="size-3.5" aria-hidden />
                Filtros
                {activeFilterCount > 0 && (
                  <span className="grid size-4 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          )}

          {error && (
            <ErrorState
              description={error}
              action={
                <button type="button" onClick={refetch} className="btn-primary">
                  <RefreshCw className="size-4" aria-hidden />
                  Tentar novamente
                </button>
              }
            />
          )}

          {loading && (
            <div className="grid gap-4 sm:grid-cols-2" aria-busy="true">
              <span className="sr-only">Carregando vagas</span>
              {Array.from({ length: 6 }).map((_, index) => (
                <JobCardSkeleton key={index} />
              ))}
            </div>
          )}

          {!loading && !error && results.length > 0 && (
            <ul className="grid list-none gap-4 sm:grid-cols-2">
              {results.map((vaga) => (
                <li key={vaga.id}>
                  <JobCard
                    vaga={vaga}
                    saved={savedIds.includes(vaga.id)}
                    selected={vaga.id === selectedId}
                    applied={candidaturasPorVaga.get(vaga.id)?.status}
                    onSelect={() => selectVaga(vaga.id)}
                    onToggleSave={() => toggleSave(vaga.id)}
                  />
                </li>
              ))}
            </ul>
          )}

          {!loading && !error && results.length === 0 && (
            <EmptyState
              icon={SearchX}
              title="Nenhuma vaga encontrada"
              description="Tente outro termo, remova filtros ou amplie a região da busca."
              action={
                <button type="button" onClick={resetAll} className="btn-primary">
                  Limpar busca e filtros
                </button>
              }
            />
          )}
        </div>

      </div>

      <Sheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        side="left"
        title="Filtrar vagas"
        className="lg:hidden"
      >
        <div className="p-4">{filtersPanel}</div>
      </Sheet>

      <Sheet
        open={detailOpen && Boolean(selected)}
        onClose={() => setDetailOpen(false)}
        side="right"
        title="Detalhes da vaga"
      >
        {selected && (
          <JobDetailPanel
            vaga={selected}
            saved={savedIds.includes(selected.id)}
            candidatura={candidaturasPorVaga.get(selected.id) ?? null}
            onToggleSave={() => toggleSave(selected.id)}
            onApply={() => {
              setDetailOpen(false)
              setApplyVagaId(selected.id)
            }}
            onClose={() => setDetailOpen(false)}
            className="h-full"
          />
        )}
      </Sheet>

      <ApplyModal
        vaga={applyVaga}
        open={Boolean(applyVaga)}
        onClose={() => setApplyVagaId(null)}
      />
    </PageShell>
  )
}
