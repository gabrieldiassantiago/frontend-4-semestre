"use client"

import { toastSuccess } from "@/lib/toast"
import { recordSearchMetadataAction } from "@/actions/vagas"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Clock4,
  Globe2,
  LayoutGrid,
  RefreshCw,
  SearchX,
  SlidersHorizontal,
  UserRound,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { PageShell } from "@/components/ui/page"
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/states"
import { ApplyModal } from "@/components/candidate/applications/apply-modal"
import { useCandidaturasPorVaga } from "@/lib/queries/use-candidaturas"
import { useVagas, useVagasProximas } from "@/lib/queries/use-vagas"
import { CATEGORIA_LABELS } from "@/lib/types/vaga.types"
import type { Vaga } from "@/lib/types/vaga.types"
import { JobCard } from "./job-card"
import { JobDetailPanel } from "./job-detail-panel"
import { JobSearchBar, EMPTY_SEARCH, type JobSearchState } from "./job-search-bar"
import { ProximityBanner } from "./proximity-banner"
import { JobFiltersModal } from "./job-filters-modal"
import { JobsSidebarWidgets } from "./jobs-sidebar-widgets"
import { JobAlertsModal } from "./job-alerts-modal"
import { calculateDistanceKm } from "@/lib/utils/distance"
import { EMPTY_FILTERS, countActiveFilters, type JobFiltersState } from "./job-filters-panel"
import { AnimatePresence, motion } from "framer-motion"

function JobCardSkeleton() {
  return (
    <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs">
      <div className="flex items-start gap-4">
        <Skeleton className="size-14 rounded-2xl" />
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-5 w-56" />
          <div className="mt-2 flex gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-28 rounded-full" />
          </div>
        </div>
      </div>
      <div className="mt-4 flex gap-4 pt-2">
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className="h-3.5 w-28" />
      </div>
    </div>
  )
}

/** Gera a lista de páginas com reticências para paginação numerada */
function getVisiblePages(currentPage: number, totalPages: number): (number | "...")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }
  const current = currentPage + 1
  if (current <= 4) {
    return [1, 2, 3, 4, 5, "...", totalPages]
  }
  if (current >= totalPages - 3) {
    return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
  }
  return [1, "...", current - 1, current, current + 1, "...", totalPages]
}

/** Ordena conforme o filtro escolhido */
function sortVagas(vagas: Vaga[], sort: JobFiltersState["sort"], isProximity = false) {
  return [...vagas].sort((a, b) => {
    if (sort === "salary-desc") return b.salario - a.salario
    if (sort === "salary-asc") return a.salario - b.salario
    if (isProximity && a.distanciaKm != null && b.distanciaKm != null) {
      return a.distanciaKm - b.distanciaKm
    }
    return new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
  })
}

export function JobsDashboardScreen() {
  const [search, setSearch] = useState<JobSearchState>(EMPTY_SEARCH)
  const [filters, setFilters] = useState<JobFiltersState>(EMPTY_FILTERS)
  const [savedIds, setSavedIds] = useState<string[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const PAGE_SIZE = 10
  const [detailOpen, setDetailOpen] = useState(false)
  const [alertsOpen, setAlertsOpen] = useState(false)
  const [applyVagaId, setApplyVagaId] = useState<string | null>(null)
  const [quickChip, setQuickChip] = useState<string>("ALL")
  const [page, setPage] = useState(0)

  // Estados de busca por proximidade
  const [proximityCoords, setProximityCoords] = useState<{ latitude: number; longitude: number } | null>(null)
  const [raioKm, setRaioKm] = useState<number>(25)
  const [isLocating, setIsLocating] = useState<boolean>(false)
  const [proximityError, setProximityError] = useState<string | null>(null)

  const serverFilters = useMemo(() => ({
    titulo: search.query.trim() || undefined,
    categoria: search.categoria === "TODAS" ? undefined : search.categoria,
    modalidade: filters.modalidades.length === 1 ? filters.modalidades[0] : undefined,
    salarioMin: filters.salarioMin > 0 ? filters.salarioMin : undefined,
    cidade: search.cidade.trim() || undefined,
    estado: search.estado.trim() || undefined,
    ativa: true,
    page,
    size: PAGE_SIZE,
  }), [filters.modalidades, filters.salarioMin, page, search])

  const { vagas, totalPages: serverTotalPages, loading, error, refetch } = useVagas(serverFilters)
  const filterSignature = JSON.stringify({ ...serverFilters, page: undefined })

  useEffect(() => {
    setPage(0)
  }, [filterSignature])

  useEffect(() => {
    const hasSearchCriteria = Boolean(
      serverFilters.titulo ||
      serverFilters.categoria ||
      serverFilters.modalidade ||
      serverFilters.salarioMin ||
      serverFilters.cidade ||
      serverFilters.estado
    )
    if (!hasSearchCriteria) return

    const timeout = setTimeout(() => {
      const searchTag = serverFilters.categoria ?? serverFilters.titulo ?? "vagas"
      void recordSearchMetadataAction({
        query: serverFilters.titulo,
        searchTag,
        metadataJson: JSON.stringify({
          filtros: serverFilters,
          ordenacao: filters.sort,
          proximidade: proximityCoords ? { raioKm } : null,
        }),
      })
    }, 700)

    return () => clearTimeout(timeout)
  }, [filters.sort, raioKm, serverFilters, proximityCoords])
  const { porVaga: candidaturasPorVaga } = useCandidaturasPorVaga()

  const searchParams = useSearchParams()
  const vagaParam = searchParams.get("vaga")
  const queryParam = searchParams.get("q")

  useEffect(() => {
    if (!vagaParam) return
    setSelectedId(vagaParam)
    setDetailOpen(true)
  }, [vagaParam])

  // Termo vindo da busca global da topbar.
  useEffect(() => {
    if (queryParam === null) return
    setSearch((current) => ({ ...current, query: queryParam }))
    setPage(0)
  }, [queryParam])

  // Busca vagas próximas no backend quando o candidato ativar busca por proximidade
  const proximity = useVagasProximas(
    proximityCoords ? { latitude: proximityCoords.latitude, longitude: proximityCoords.longitude, raioKm } : null,
  )
  const proximityFetchError = proximity.error
  const refetchProximity = proximity.refetch
  const proximityVagas = useMemo<Vaga[] | null>(() => {
    if (!proximityCoords || !proximity.vagas) return null
    return proximity.vagas.map((v: Vaga) => {
      let dist = v.distanciaKm
      if (dist == null && v.latitude != null && v.longitude != null) {
        dist = calculateDistanceKm(proximityCoords.latitude, proximityCoords.longitude, v.latitude, v.longitude)
      }
      return { ...v, distanciaKm: dist }
    })
  }, [proximityCoords, proximity.vagas])

  const handleRequestProximity = () => {
    setProximityError(null)
    if (typeof window === "undefined" || !navigator.geolocation) {
      setProximityError("Geolocalização não é suportada pelo seu navegador.")
      return
    }
    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false)
        setProximityCoords({
          latitude: Number(position.coords.latitude.toFixed(6)),
          longitude: Number(position.coords.longitude.toFixed(6)),
        })
        setProximityError(null)
      },
      (err) => {
        setIsLocating(false)
        if (err.code === err.PERMISSION_DENIED) {
          setProximityError(
            "Acesso à localização não permitido pelo navegador. Você pode continuar buscando vagas normalmente por cidade ou estado."
          )
        } else {
          setProximityError("Não foi possível obter sua localização no momento.")
        }
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    )
  }

  const handleClearProximity = () => {
    setProximityCoords(null)
    setProximityError(null)
  }

  // Apenas vagas buscadas do servidor (ou por proximidade)
  const baseVagas: Vaga[] = useMemo(() => {
    if (proximityCoords) return proximityVagas ?? []
    return vagas ?? []
  }, [proximityCoords, proximityVagas, vagas])

  const results = useMemo(() => {
    const term = search.query.trim().toLowerCase()
    const outro = search.outro.trim().toLowerCase()
    const cidade = search.cidade.trim().toLowerCase()
    const estado = search.estado.trim().toLowerCase()

    const matched = baseVagas.filter((vaga) => {
      if (!vaga.ativa) return false

      const matchesTerm =
        !term ||
        vaga.titulo.toLowerCase().includes(term) ||
        (vaga.nomeEmpresa ?? "").toLowerCase().includes(term) ||
        (CATEGORIA_LABELS[vaga.categoria] ?? "").toLowerCase().includes(term) ||
        (vaga.descricao ?? "").toLowerCase().includes(term)

      const matchesOutro =
        search.categoria !== "OUTRO" ||
        !outro ||
        [vaga.titulo, vaga.nomeEmpresa, vaga.descricao, vaga.beneficios]
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

      const matchesSalario =
        filters.salarioMin === 0 || vaga.salario >= filters.salarioMin

      return (
        matchesTerm &&
        matchesOutro &&
        matchesCidade &&
        matchesEstado &&
        matchesCategoria &&
        matchesModalidade &&
        matchesSalario
      )
    })

    return sortVagas(matched, filters.sort, Boolean(proximityCoords))
  }, [baseVagas, search, filters, proximityCoords])

  const totalPages = useMemo(() => {
    if (proximityCoords) {
      return Math.max(1, Math.ceil(results.length / PAGE_SIZE))
    }
    if (serverTotalPages && serverTotalPages > 1) {
      return serverTotalPages
    }
    if (vagas.length === PAGE_SIZE) {
      return page + 2
    }
    return Math.max(1, page + 1)
  }, [proximityCoords, results.length, serverTotalPages, vagas.length, page])

  const displayedResults = useMemo(() => {
    if (proximityCoords) {
      return results.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
    }
    return results
  }, [proximityCoords, results, page])

  const hasNextPage = page < totalPages - 1 || (!proximityCoords && vagas.length === PAGE_SIZE)
  const hasPrevPage = page > 0

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const selected = displayedResults.find((vaga) => vaga.id === selectedId) ?? displayedResults[0] ?? null
  const applyVaga = baseVagas.find((vaga) => vaga.id === applyVagaId) ?? null
  const activeFilterCount = countActiveFilters(filters) + (proximityCoords ? 1 : 0)

  const toggleSave = (id: string) => {
    toastSuccess(savedIds.includes(id) ? "Vaga desmarcada nesta sessão." : "Vaga marcada nesta sessão.")
    setSavedIds((ids) => (ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]))
  }

  const selectVaga = (id: string) => {
    setSelectedId(id)
    setDetailOpen(true)
  }

  const resetAll = () => {
    setSearch(EMPTY_SEARCH)
    setFilters(EMPTY_FILTERS)
    setQuickChip("ALL")
    handleClearProximity()
  }

  const handleChipClick = (chipId: string) => {
    setQuickChip(chipId)
    if (chipId === "ALL") {
      setFilters((prev) => ({ ...prev, modalidades: [] }))
    } else if (chipId === "REMOTO") {
      setFilters((prev) => ({ ...prev, modalidades: ["REMOTO"] }))
    } else if (chipId === "HIBRIDO") {
      setFilters((prev) => ({ ...prev, modalidades: ["HIBRIDO"] }))
    } else if (chipId === "PRESENCIAL") {
      setFilters((prev) => ({ ...prev, modalidades: ["PRESENCIAL"] }))
    } else {
      // Outros chips rápidos
      setFilters((prev) => ({ ...prev, modalidades: [] }))
    }
  }

  const isPageLoading = loading && vagas.length === 0 && !proximityVagas
  const pageError = proximityFetchError || (!proximityCoords && error && vagas.length === 0 ? error : null)

  const QUICK_CHIPS = [
    { id: "ALL", label: "Todas as vagas", icon: LayoutGrid },
    { id: "REMOTO", label: "Remoto", icon: Globe2 },
    { id: "HIBRIDO", label: "Híbrido", icon: Building2 },
    { id: "PRESENCIAL", label: "Presencial", icon: UserRound },
    { id: "FULL_TIME", label: "Tempo integral", icon: Clock },
    { id: "PART_TIME", label: "Meio período", icon: Clock4 },
  ]

  return (
    <PageShell className="max-w-[1560px] px-4 py-2 sm:px-6">
      {/* 1. Barra de Busca Superior */}
      <header className="flex flex-col gap-4">
        <JobSearchBar
          value={search}
          onSubmit={setSearch}
          onOpenFilters={() => setFiltersOpen(true)}
          activeFilterCount={activeFilterCount}
          onProximitySearch={handleRequestProximity}
          isProximityActive={Boolean(proximityCoords)}
          isLocating={isLocating}
        />
      </header>

      {/* 2. Pílulas de Filtros Rápidos (Chips) */}
      <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {QUICK_CHIPS.map((chip) => {
          const active = quickChip === chip.id
          const ChipIcon = chip.icon
          return (
            <button
              key={chip.id}
              type="button"
              onClick={() => handleChipClick(chip.id)}
              className={cn(
                "inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200 active:scale-95",
                active
                  ? "bg-primary text-white shadow-xs"
                  : "border border-border/90 bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <ChipIcon className={cn("size-3.5", active ? "text-white" : "text-muted-foreground")} />
              <span>{chip.label}</span>
            </button>
          )
        })}

        {/* Botão Mais Filtros */}
        <button
          type="button"
          onClick={() => setFiltersOpen(true)}
          className={cn(
            "inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition-all duration-200 hover:bg-muted",
            activeFilterCount > 0
              ? "border-primary bg-primary-subtle text-primary"
              : "border-border/90 bg-card text-muted-foreground"
          )}
        >
          <SlidersHorizontal className="size-3.5" />
          <span>Mais filtros</span>
          {activeFilterCount > 0 && (
            <span className="grid size-4 place-items-center rounded-full bg-primary text-[10px] font-bold text-white">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* 3. Linha de Contagem e Ordenação */}
      <div className="mt-5 flex items-center justify-between gap-4">
        <p aria-live="polite" className="text-sm font-bold text-foreground">
          {results.length} {results.length === 1 ? "vaga encontrada" : "vagas encontradas"}
          {proximityCoords && (
            <span className="font-normal text-muted-foreground"> em um raio de {raioKm} km</span>
          )}
        </p>

        <div className="flex items-center gap-2">
          <span className="hidden text-xs font-medium text-subtle-foreground sm:inline">
            Ordenar por:
          </span>
          <select
            value={filters.sort}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                sort: e.target.value as JobFiltersState["sort"],
              }))
            }
            className="h-8 rounded-xl border border-border/80 bg-card px-3 text-xs font-semibold text-strong-foreground outline-none transition-colors hover:border-border-strong focus:border-primary"
          >
            <option value="recent">Mais recentes</option>
            <option value="salary-desc">Maior salário</option>
            <option value="salary-asc">Menor salário</option>
          </select>
        </div>
      </div>

      {/* 4. Conteúdo Principal: Feed de Vagas + Coluna Lateral de Widgets */}
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-start">
        {/* Feed de Vagas Central */}
        <div className="min-w-0 flex-1 space-y-4">
          {/* Banner de Proximidade Ativa */}
          {(Boolean(proximityCoords) || Boolean(proximityError)) && (
            <ProximityBanner
              isActive={Boolean(proximityCoords)}
              raioKm={raioKm}
              onChangeRaio={setRaioKm}
              onClear={handleClearProximity}
              error={proximityError}
              onRetry={handleRequestProximity}
              onDismissError={() => setProximityError(null)}
            />
          )}

          {pageError && (
            <ErrorState
              description={pageError}
              action={
                <button
                  type="button"
                  onClick={() => {
                    if (proximityCoords) void refetchProximity()
                    else void refetch()
                  }}
                  className="btn-primary"
                >
                  <RefreshCw className="size-4" aria-hidden />
                  Tentar novamente
                </button>
              }
            />
          )}

          {isPageLoading && (
            <div className="space-y-4" aria-busy="true">
              <span className="sr-only">Carregando oportunidades...</span>
              {Array.from({ length: 4 }).map((_, index) => (
                <JobCardSkeleton key={index} />
              ))}
            </div>
          )}

          {!isPageLoading && !pageError && displayedResults.length > 0 && (
            <ul className="grid list-none gap-4">
              {displayedResults.map((vaga, index) => (
                <motion.li
                  key={vaga.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.28, delay: Math.min(index, 6) * 0.04 }}
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

          {/* Paginação Numerada */}
          {!isPageLoading && !pageError && displayedResults.length > 0 && totalPages > 1 && (
            <nav
              aria-label="Paginação de vagas"
              className="mt-8 flex flex-col items-center justify-between gap-4 rounded-3xl border border-border/80 bg-card p-4 sm:px-6 shadow-xs sm:flex-row"
            >
              <p className="text-xs font-medium text-muted-foreground">
                Página <span className="font-bold text-foreground">{page + 1}</span> de{" "}
                <span className="font-bold text-foreground">{totalPages}</span>
              </p>

              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={!hasPrevPage || loading}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-strong-foreground shadow-xs transition-all hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="size-4" />
                  <span className="hidden sm:inline">Anterior</span>
                </button>

                {/* Números das páginas */}
                <div className="flex items-center gap-1">
                  {getVisiblePages(page, totalPages).map((p, idx) => {
                    if (p === "...") {
                      return (
                        <span
                          key={`ellipsis-${idx}`}
                          className="grid size-8 sm:size-9 place-items-center text-xs font-semibold text-subtle-foreground select-none"
                        >
                          ...
                        </span>
                      )
                    }

                    const pageIndex = p - 1
                    const isActive = page === pageIndex

                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => handlePageChange(pageIndex)}
                        disabled={loading}
                        aria-current={isActive ? "page" : undefined}
                        className={cn(
                          "grid size-8 sm:size-9 place-items-center rounded-xl text-xs font-semibold transition-all duration-200",
                          isActive
                            ? "bg-primary text-white shadow-xs font-bold scale-105"
                            : "border border-border/70 bg-card text-strong-foreground hover:bg-muted hover:border-border-strong"
                        )}
                      >
                        {p}
                      </button>
                    )
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={!hasNextPage || loading}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-strong-foreground shadow-xs transition-all hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span className="hidden sm:inline">Próxima</span>
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </nav>
          )}

          {!isPageLoading && !pageError && results.length === 0 && (
            <EmptyState
              icon={SearchX}
              title="Nenhuma vaga encontrada"
              description="Não encontramos oportunidades com os critérios informados. Tente limpar os filtros ou buscar por outro termo."
              action={
                <button type="button" onClick={resetAll} className="btn-primary">
                  Limpar busca e filtros
                </button>
              }
            />
          )}
        </div>

        {/* Coluna Direita: Widgets */}
        <JobsSidebarWidgets
          onOpenAlertsModal={() => setAlertsOpen(true)}
          onSelectCompany={(companyName) => {
            setSearch((prev) => ({ ...prev, query: companyName }))
          }}
          vagas={baseVagas}
        />
      </div>

      {/* Modais */}
      {/* 1. Modal Detalhes da Vaga */}
      <AnimatePresence>
        {detailOpen && selected && (
          <motion.div
            key="job-detail-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-strong/40 p-3 backdrop-blur-xs sm:p-4"
            role="dialog"
            aria-modal="true"
            onClick={() => setDetailOpen(false)}
          >
            <motion.div
              key="job-detail-card"
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              transition={{ type: "spring", duration: 0.3, bounce: 0.15 }}
              className="relative max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-3xl border border-border bg-card shadow-2xl"
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
                className="max-h-[90vh]"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Modal de Candidatura */}
      <ApplyModal
        vaga={applyVaga}
        open={Boolean(applyVaga)}
        onClose={() => setApplyVagaId(null)}
      />

      {/* 3. Modal de Filtros Completos */}
      <JobFiltersModal
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        filters={filters}
        onChange={setFilters}
        totalCount={results.length}
        isProximityActive={Boolean(proximityCoords)}
        raioKm={raioKm}
        onChangeRaio={setRaioKm}
        onToggleProximity={proximityCoords ? handleClearProximity : handleRequestProximity}
        isLocating={isLocating}
      />

      {/* 4. Modal de Alertas por E-mail */}
      <JobAlertsModal open={alertsOpen} onClose={() => setAlertsOpen(false)} />
    </PageShell>
  )
}
