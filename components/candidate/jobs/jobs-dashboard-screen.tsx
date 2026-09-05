"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import {
  Bookmark,
  Briefcase,
  Building2,
  CheckCircle2,
  Globe2,
  RefreshCw,
  SearchX,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { PageShell } from "@/components/ui/page"
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/states"
import { Sheet } from "@/components/ui/sheet"
import { ApplyModal } from "@/components/candidatura/apply-modal"
import { useCandidaturasPorVaga } from "@/lib/hooks/useCandidaturas"
import { useVagas } from "@/lib/hooks/useVagas"
import { CATEGORIA_LABELS } from "@/lib/types/vaga.types"
import type { Vaga, VagaCategoria } from "@/lib/types/vaga.types"
import { JobCard } from "./job-card"
import { JobDetailPanel } from "./job-detail-panel"
import { JobSearchBar, EMPTY_SEARCH, type JobSearchState } from "./job-search-bar"

import {
  JobFiltersPanel,
  EMPTY_FILTERS,
  countActiveFilters,
  type JobFiltersState,
} from "./job-filters-panel"
import { AnimatePresence, motion } from "framer-motion"

function JobCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start gap-3.5">
        <Skeleton className="size-11 rounded-xl" />
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
      <div className="mt-4 flex gap-1.5">
        <Skeleton className="h-6 w-20 rounded-md" />
        <Skeleton className="h-6 w-24 rounded-md" />
        <Skeleton className="h-6 w-24 rounded-md" />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 border-t border-border-subtle pt-3">
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className="h-3.5 w-24" />
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-border-subtle pt-3">
        <Skeleton className="h-4 w-28" />
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

// Pílulas de categorias rápidas no topo
const QUICK_CATEGORIES: { id: VagaCategoria | "TODAS"; label: string }[] = [
  { id: "TODAS", label: "Todas as vagas" },
  { id: "VENDAS", label: "Vendas & Comercial" },
  { id: "MEDICINA", label: "Saúde & Medicina" },
  { id: "FINANCEIRO", label: "Finanças" },
  { id: "RECURSOS_HUMANOS", label: "Recursos Humanos" },
  { id: "MARKETING_DIGITAL", label: "Marketing" },
  { id: "DESENVOLVIMENTO_SOFTWARE", label: "Tecnologia" },
  { id: "LOGISTICA", label: "Logística" },
  { id: "ENGENHARIA_CIVIL", label: "Engenharia" },
]

export function JobsDashboardScreen() {
  const [search, setSearch] = useState<JobSearchState>(EMPTY_SEARCH)
  const [filters, setFilters] = useState<JobFiltersState>(EMPTY_FILTERS)
  const [savedIds, setSavedIds] = useState<string[]>([])
  const [onlySaved, setOnlySaved] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [applyVagaId, setApplyVagaId] = useState<string | null>(null)

  const { vagas, loading, error, refetch } = useVagas()
  const { porVaga: candidaturasPorVaga } = useCandidaturasPorVaga()

  const searchParams = useSearchParams()
  const vagaParam = searchParams.get("vaga")

  useEffect(() => {
    if (!vagaParam || vagas.length === 0) return
    if (!vagas.some((vaga) => vaga.id === vagaParam)) return
    setSelectedId(vagaParam)
    setDetailOpen(true)
  }, [vagaParam, vagas])

  const results = useMemo(() => {
    const term = search.query.trim().toLowerCase()
    const outro = search.outro.trim().toLowerCase()
    const cidade = search.cidade.trim().toLowerCase()
    const estado = search.estado.trim().toLowerCase()

    const matched = vagas.filter((vaga) => {
      if (!vaga.ativa) return false
      if (onlySaved && !savedIds.includes(vaga.id)) return false

      const matchesTerm =
        !term ||
        vaga.titulo.toLowerCase().includes(term) ||
        (vaga.companyName ?? "").toLowerCase().includes(term) ||
        CATEGORIA_LABELS[vaga.categoria]?.toLowerCase().includes(term) ||
        (vaga.descricao ?? "").toLowerCase().includes(term)

      const matchesOutro =
        search.categoria !== "OUTRO" ||
        !outro ||
        [vaga.titulo, vaga.companyName, vaga.descricao, vaga.beneficios]
          .filter(Boolean)
          .some((field) => field!.toLowerCase().includes(outro))

      const matchesCidade =
        !cidade ||
        vaga.cidade.toLowerCase().includes(cidade) ||
        cidade.includes(vaga.cidade.toLowerCase())

      const matchesEstado =
        !estado ||
        vaga.estado.toLowerCase() === estado ||
        vaga.estado.toLowerCase().includes(estado)

      const matchesCategoria =
        search.categoria === "TODAS" || vaga.categoria === search.categoria

      const matchesModalidade =
        filters.modalidades.length === 0 ||
        filters.modalidades.includes(vaga.modalidade)

      const matchesNivel =
        filters.niveis.length === 0 ||
        filters.niveis.includes(vaga.nivelExperiencia)

      const matchesSalario =
        filters.salarioMin === 0 || vaga.salario >= filters.salarioMin

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
  }, [vagas, search, filters, onlySaved, savedIds])

  useEffect(() => {
    if (results.length === 0) {
      setSelectedId(null)
      return
    }
    setSelectedId((current) =>
      current && results.some((vaga) => vaga.id === current) ? current : results[0].id
    )
  }, [results])

  const selected = results.find((vaga) => vaga.id === selectedId) ?? null
  const applyVaga = vagas.find((vaga) => vaga.id === applyVagaId) ?? null
  const activeFilterCount = countActiveFilters(filters) + (onlySaved ? 1 : 0)

  const toggleSave = (id: string) =>
    setSavedIds((ids) => (ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]))

  const selectVaga = (id: string) => {
    setSelectedId(id)
    setDetailOpen(true)
  }

  const resetAll = () => {
    setSearch(EMPTY_SEARCH)
    setFilters(EMPTY_FILTERS)
    setOnlySaved(false)
  }

  const filtersPanel = (
    <JobFiltersPanel filters={filters} onChange={setFilters} />
  )

  return (
    <PageShell className="max-w-[1560px]">
      <header className="flex flex-col gap-4">

        <JobSearchBar
          value={search}
          onSubmit={setSearch}
          onOpenFilters={() => setFiltersOpen(true)}
          activeFilterCount={activeFilterCount}
        />
      </header>

      {/* Categorias rápidas */}
      <div className="mt-5 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {QUICK_CATEGORIES.map((cat) => {
          const active =
            cat.id === "TODAS" ? search.categoria === "TODAS" : search.categoria === cat.id
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSearch((prev) => ({ ...prev, categoria: cat.id as JobSearchState["categoria"] }))}
              className={cn(
                "shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-200",
                active
                  ? "border-primary bg-primary text-primary-foreground shadow-[0_6px_16px_-4px_rgb(124_58_237/0.45)]"
                  : "border-border bg-card text-muted-foreground hover:border-border-strong hover:text-foreground",
              )}
            >
              {cat.label}
            </button>
          )
        })}
      </div>

      {/* Conteúdo Principal: Filtros + Grid de Vagas */}
      <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-start">
        {/* Filtros Lateral Desktop */}
        <div className="hidden w-64 shrink-0 lg:sticky lg:top-6 lg:block">
          {filtersPanel}
        </div>



        {/* Listagem de Vagas */}
        <div className="min-w-0 flex-1">
          {!loading && !error && (
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <p aria-live="polite" className="text-sm text-muted-foreground">
                  Exibindo <strong className="font-bold text-foreground">{results.length}</strong>{" "}
                  {results.length === 1 ? "vaga disponível" : "vagas disponíveis"}
                </p>
                {(search.query || search.categoria !== "TODAS" || search.cidade || search.estado || activeFilterCount > 0) && (
                  <button
                    type="button"
                    onClick={resetAll}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    • Limpar filtros
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setFiltersOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted lg:hidden"
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
            <div className="grid gap-5 sm:grid-cols-2" aria-busy="true">
              <span className="sr-only">Carregando oportunidades...</span>
              {Array.from({ length: 6 }).map((_, index) => (
                <JobCardSkeleton key={index} />
              ))}
            </div>
          )}

          {!loading && !error && results.length > 0 && (
            <ul className="grid list-none gap-5 sm:grid-cols-2">
              {results.map((vaga, index) => (
                <motion.li
                  key={vaga.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: Math.min(index, 8) * 0.03 }}
                >
                  <JobCard
                    vaga={vaga}
                    saved={savedIds.includes(vaga.id)}
                    selected={vaga.id === selectedId}
                    applied={candidaturasPorVaga.get(vaga.id)?.status}
                    onSelect={() => selectVaga(vaga.id)}
                    onToggleSave={() => toggleSave(vaga.id)}
                  />
                </motion.li>
              ))}
            </ul>
          )}

          {!loading && !error && results.length === 0 && (
            <EmptyState
              icon={SearchX}
              title="Nenhuma vaga encontrada"
              description="Não encontramos vagas com os critérios informados. Tente ajustar o termo de busca, selecionar outra área ou limpar os filtros."
              action={
                <button type="button" onClick={resetAll} className="btn-primary">
                  Limpar busca e filtros
                </button>
              }
            />
          )}
        </div>
      </div>

      {/* Drawer de Filtros Mobile */}
      <Sheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        side="left"
        title="Filtrar vagas"
        className="lg:hidden"
      >
        <div className="p-4">{filtersPanel}</div>
      </Sheet>

      <AnimatePresence>
        {detailOpen && selected && (
          <motion.div
            key="job-detail-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-0 backdrop-blur-xs sm:p-4"
            role="dialog"
            aria-modal="true"
            onClick={() => setDetailOpen(false)}
          >
            <motion.div
              key="job-detail-card"
              initial={{ opacity: 0, scale: 0.98, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 15 }}
              transition={{ type: "spring", duration: 0.3, bounce: 0.15 }}
              className="relative h-full w-full max-h-full overflow-hidden bg-card border border-border shadow-2xl sm:h-auto sm:max-h-[90vh] sm:w-full sm:max-w-2xl sm:rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            >
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
                className="h-full sm:max-h-[90vh]"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ApplyModal
        vaga={applyVaga}
        open={Boolean(applyVaga)}
        onClose={() => setApplyVagaId(null)}
      />
    </PageShell>
  )
}

