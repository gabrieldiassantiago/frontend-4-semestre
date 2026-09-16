"use client"

import { useEffect, useId, useRef, useState } from "react"
import {
  Briefcase,
  Building2,
  Check,
  ChevronDown,
  Globe,
  Layers,
  Loader2,
  MapPin,
  Navigation,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"

import { cn } from "@/lib/utils"
import {
  searchLocalidades,
  POPULAR_LOCATIONS,
  type LocalidadeOption,
} from "@/lib/services/ibge.service"
import {
  CATEGORIA_LABELS,
  type VagaCategoria,
} from "@/lib/types/vaga.types"
import {
  CATEGORY_METADATA,
  CATEGORY_SECTORS,
} from "@/lib/constants/vaga-categories"

export interface JobSearchState {
  query: string
  categoria: VagaCategoria | "TODAS"
  outro: string
  cidade: string
  estado: string
}

export const EMPTY_SEARCH: JobSearchState = {
  query: "",
  categoria: "TODAS",
  outro: "",
  cidade: "",
  estado: "",
}

const POPULAR_SEARCH_SUGGESTIONS = [
  "Vendas",
  "Enfermagem",
  "Financeiro",
  "Recursos Humanos",
  "Marketing",
  "Design",
  "Desenvolvedor",
  "Logística",
  "Estágio",
]

/**
 * Seletor unificado e inteligente de Localidade (Cidade + Estado / Brasil).
 */
function UnifiedLocationSelect({
  cidade,
  estado,
  onChange,
}: {
  cidade: string
  estado: string
  onChange: (cidade: string, estado: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [options, setOptions] = useState<LocalidadeOption[]>(POPULAR_LOCATIONS)
  const [loading, setLoading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const hasLocation = Boolean(cidade || estado)
  const displayLabel =
    cidade && estado
      ? `${cidade}, ${estado}`
      : cidade
        ? cidade
        : estado
          ? `Estado de ${estado}`
          : "Todas as cidades"

  useEffect(() => {
    if (!open) return
    let active = true
    setLoading(true)

    const timer = setTimeout(() => {
      searchLocalidades(searchTerm)
        .then((res) => {
          if (active) {
            setOptions(res)
            setLoading(false)
          }
        })
        .catch(() => {
          if (active) {
            setOptions(POPULAR_LOCATIONS)
            setLoading(false)
          }
        })
    }, 150)

    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [searchTerm, open])

  useEffect(() => {
    if (!open) return

    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false)
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleEscape)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [open])

  return (
    <div ref={containerRef} className="relative min-w-0 flex-1 lg:w-72">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-label="Selecionar localização"
        className={cn(
          "flex h-12 w-full items-center gap-2.5 rounded-xl border px-3 text-left outline-none transition-all duration-200",
          open
            ? "border-primary bg-background shadow-sm ring-2 ring-primary/20"
            : "border-transparent bg-surface hover:bg-muted",
        )}
      >
        <div
          className={cn(
            "grid size-8 shrink-0 place-items-center rounded-lg transition-colors",
            hasLocation ? "bg-primary-subtle text-primary" : "bg-background text-muted-foreground shadow-xs"
          )}
        >
          <MapPin className="size-4" />
        </div>

        <div className="min-w-0 flex-1">
          <span className="block text-[10px] font-medium leading-none text-muted-foreground">
            Localização
          </span>
          <span className="mt-1 block truncate text-xs font-semibold leading-none text-foreground sm:text-sm">
            {displayLabel}
          </span>
        </div>

        {hasLocation ? (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation()
              onChange("", "")
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.stopPropagation()
                onChange("", "")
              }
            }}
            className="grid size-6 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Limpar localização"
          >
            <X className="size-3.5" />
          </span>
        ) : (
          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
              open && "rotate-180"
            )}
          />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="absolute left-0 top-[calc(100%+8px)] z-50 w-full min-w-[280px] sm:min-w-[320px] rounded-2xl border border-border bg-card p-2.5 shadow-overlay"
          >
            {/* Campo de pesquisa de cidade */}
            <div className="relative mb-2">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                autoFocus
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar cidade ou estado (ex: Curitiba, PR)"
                className="h-10 w-full rounded-xl bg-surface pl-9 pr-3 text-xs text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:bg-background focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Opção: Todo o Brasil */}
            <button
              type="button"
              onClick={() => {
                onChange("", "")
                setOpen(false)
              }}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs sm:text-sm font-medium transition-colors hover:bg-muted",
                !cidade && !estado && "bg-primary-subtle font-semibold text-primary"
              )}
            >
              <Globe className="size-4 shrink-0 text-primary" />
              <span className="flex-1">Todo o Brasil (qualquer local)</span>
              {!cidade && !estado && <Check className="size-4 shrink-0 text-primary" />}
            </button>

            <div className="my-1 border-t border-border-subtle" />

            <p className="px-3 py-1 text-[11px] font-semibold text-muted-foreground">
              {searchTerm ? "Resultados da busca" : "Principais regiões"}
            </p>

            <div className="max-h-56 overflow-y-auto space-y-0.5">
              {loading && options.length === 0 ? (
                <div className="py-4 text-center text-xs text-muted-foreground">
                  Buscando cidades no IBGE...
                </div>
              ) : options.length > 0 ? (
                options.map((opt) => {
                  const isSelected = cidade === opt.cidade && estado === opt.estado
                  return (
                    <button
                      key={`${opt.cidade}-${opt.estado}`}
                      type="button"
                      onClick={() => {
                        onChange(opt.cidade, opt.estado)
                        setOpen(false)
                      }}
                      className={cn(
                        "flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-xs sm:text-sm transition-colors hover:bg-muted",
                        isSelected && "bg-primary-subtle font-semibold text-primary"
                      )}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <MapPin className="size-3.5 shrink-0 text-muted-foreground" />
                        <span className="truncate">{opt.label}</span>
                      </div>
                      {isSelected && <Check className="size-4 shrink-0 text-primary" />}
                    </button>
                  )
                })
              ) : (
                <div className="py-4 text-center text-xs text-muted-foreground">
                  Nenhuma cidade encontrada. Tente outro termo.
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/**
 * Seletor avançado e animado de Área / Categoria para todos os setores do mercado de trabalho.
 */
function CategorySelect({
  categoria,
  outro,
  onChange,
}: {
  categoria: VagaCategoria | "TODAS"
  outro: string
  onChange: (cat: VagaCategoria | "TODAS", outroVal?: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedMeta = categoria !== "TODAS" && categoria !== "OUTRO" ? CATEGORY_METADATA[categoria] : null
  const SelectedIcon = selectedMeta?.icon ?? Layers

  const selectedLabel =
    categoria === "TODAS"
      ? "Todas as áreas"
      : categoria === "OUTRO"
        ? outro || "Outras áreas"
        : selectedMeta?.label ?? CATEGORIA_LABELS[categoria]

  useEffect(() => {
    if (!open) return

    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false)
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleEscape)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [open])

  // Filtragem de categorias por busca
  const filteredSectors = CATEGORY_SECTORS.map((sector) => ({
    ...sector,
    categories: sector.categories.filter(
      (cat) =>
        cat.label.toLowerCase().includes(query.trim().toLowerCase()) ||
        cat.shortLabel?.toLowerCase().includes(query.trim().toLowerCase()) ||
        sector.name.toLowerCase().includes(query.trim().toLowerCase())
    ),
  })).filter((sector) => sector.categories.length > 0)

  return (
    <div ref={containerRef} className="relative min-w-0 flex-1 lg:w-72">
      <button
        type="button"
        onClick={() => {
          setOpen((prev) => !prev)
          if (!open) setQuery("")
        }}
        aria-expanded={open}
        aria-label="Selecionar área de atuação"
        className={cn(
          "flex h-12 w-full items-center gap-2.5 rounded-xl border px-3 text-left outline-none transition-all duration-200",
          open
            ? "border-primary bg-background shadow-sm ring-2 ring-primary/20"
            : "border-transparent bg-surface hover:bg-muted",
        )}
      >
        <div
          className={cn(
            "grid size-8 shrink-0 place-items-center rounded-lg transition-colors",
            categoria !== "TODAS"
              ? "bg-primary-subtle text-primary"
              : "bg-background text-muted-foreground shadow-xs"
          )}
        >
          <SelectedIcon className="size-4" />
        </div>

        <div className="min-w-0 flex-1">
          <span className="block text-[10px] font-medium leading-none text-muted-foreground">
            Área de atuação
          </span>
          <span className="mt-1 block truncate text-xs font-semibold leading-none text-foreground sm:text-sm">
            {selectedLabel}
          </span>
        </div>

        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="absolute left-0 top-[calc(100%+8px)] z-50 w-full min-w-[300px] sm:min-w-[360px] rounded-2xl border border-border bg-card p-3 shadow-overlay"
          >
            {/* Cabeçalho com pesquisa de área */}
            <div className="relative mb-2">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filtrar área (ex: Saúde, Vendas, TI...)"
                className="h-10 w-full rounded-xl bg-surface pl-9 pr-3 text-xs text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:bg-background focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Opção: Todas as áreas */}
            <button
              type="button"
              onClick={() => {
                onChange("TODAS", "")
                setOpen(false)
              }}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs sm:text-sm font-medium transition-colors hover:bg-muted",
                categoria === "TODAS" && "bg-primary-subtle font-semibold text-primary"
              )}
            >
              <Layers className="size-4 shrink-0 text-primary" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground">Todas as áreas</p>
                <p className="text-[11px] text-muted-foreground">Exibir oportunidades de qualquer setor</p>
              </div>
              {categoria === "TODAS" && <Check className="size-4 shrink-0 text-primary" />}
            </button>

            <div className="my-2 border-t border-border-subtle" />

            {/* Lista de setores agrupados */}
            <div className="max-h-72 overflow-y-auto pr-1 space-y-3">
              {filteredSectors.map((sector) => {
                const SectorIcon = sector.icon
                return (
                  <div key={sector.name} className="space-y-1">
                    <div className="flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      <SectorIcon className="size-3.5 text-primary" />
                      <span>{sector.name}</span>
                    </div>

                    <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                      {sector.categories.map((cat) => {
                        const Icon = cat.icon
                        const isSelected = categoria === cat.id

                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => {
                              onChange(cat.id, "")
                              setOpen(false)
                            }}
                            className={cn(
                              "flex items-center gap-2 rounded-xl px-2.5 py-2 text-left text-xs transition-colors hover:bg-muted",
                              isSelected
                                ? "bg-primary-subtle font-semibold text-primary border border-primary/20"
                                : "bg-surface/50 text-foreground"
                            )}
                          >
                            <span
                              className={cn(
                                "grid size-6 shrink-0 place-items-center rounded-lg border",
                                cat.color
                              )}
                            >
                              <Icon className="size-3.5" />
                            </span>
                            <span className="truncate">{cat.shortLabel ?? cat.label}</span>
                            {isSelected && (
                              <Check className="ml-auto size-3.5 shrink-0 text-primary" />
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}

              {filteredSectors.length === 0 && (
                <div className="py-6 text-center text-xs text-muted-foreground">
                  Nenhuma categoria encontrada com “{query}”.
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function JobSearchBar({
  value,
  onSubmit,
  onOpenFilters,
  activeFilterCount,
  onProximitySearch,
  isProximityActive = false,
  isLocating = false,
}: {
  value: JobSearchState
  onSubmit: (next: JobSearchState) => void
  onOpenFilters: () => void
  activeFilterCount: number
  onProximitySearch?: () => void
  isProximityActive?: boolean
  isLocating?: boolean
}) {
  const [draft, setDraft] = useState(value)
  const queryId = useId()

  useEffect(() => {
    setDraft(value)
  }, [value])

  const update = <K extends keyof JobSearchState>(
    key: K,
    next: JobSearchState[K],
  ) => {
    setDraft((current) => ({
      ...current,
      [key]: next,
    }))
  }

  return (
    <motion.section
      aria-label="Buscar vagas"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="rounded-[1.75rem] bg-card p-2 shadow-[0_8px_30px_rgba(0,0,0,0.07)] sm:p-2"
    >
      <form
        onSubmit={(event) => {
          event.preventDefault()
          onSubmit(draft)
        }}
        className="flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-1"
      >
        {/* Campo de Busca Livre (Cargo, Empresa ou Palavra-chave) */}
        <div className="relative min-w-0 flex-[1.25] lg:pl-2">
          <label htmlFor={queryId} className="sr-only">
            Cargo, empresa ou palavra-chave
          </label>

          <Search
            className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />

          <input
            id={queryId}
            type="search"
            value={draft.query}
            onChange={(event) => update("query", event.target.value)}
            placeholder="Cargo, empresa ou palavra-chave..."
            className="h-12 w-full rounded-2xl bg-surface pl-11 pr-4 text-sm text-foreground outline-none transition-none placeholder:text-slate-400 focus:bg-surface focus:ring-0 focus:outline-none lg:bg-transparent lg:focus:bg-transparent"
          />
        </div>

        <span className="hidden h-8 w-px bg-slate-200 lg:block" aria-hidden />

        {/* Seletor de Localização unificado Cidade + Estado */}
        <UnifiedLocationSelect
          cidade={draft.cidade}
          estado={draft.estado}
          onChange={(cidade, estado) => {
            setDraft((curr) => ({
              ...curr,
              cidade,
              estado,
            }))
          }}
        />

        <span className="hidden h-8 w-px bg-slate-200 lg:block" aria-hidden />

        {/* Seletor de Categoria/Área de atuação */}
        <CategorySelect
          categoria={draft.categoria}
          outro={draft.outro}
          onChange={(cat, outroVal) => {
            setDraft((curr) => ({
              ...curr,
              categoria: cat,
              outro: outroVal ?? "",
            }))
          }}
        />

        {/* Botão Principal de Busca */}
        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-2xl bg-[#7c3aed] px-6 text-sm font-bold text-white shadow-[0_4px_14px_rgba(124,58,237,0.3)] transition-all hover:bg-[#6d28d9] lg:ml-1"
        >
          <Search className="size-4" aria-hidden />
          <span>Buscar</span>

        </motion.button>

        {/* Botão de Busca por Proximidade */}
        {onProximitySearch && (
          <motion.button
            type="button"
            onClick={onProximitySearch}
            disabled={isLocating}
            whileTap={{ scale: 0.96 }}
            title="Buscar vagas mais próximas de você usando sua localização"
            className={cn(
              "inline-flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-2xl px-3.5 text-xs font-bold transition-all lg:ml-1 lg:h-10 lg:rounded-full",
              isProximityActive
                ? "border border-primary/30 bg-primary-subtle text-primary shadow-xs"
                : "border border-border bg-surface text-foreground hover:bg-muted"
            )}
          >
            {isLocating ? (
              <Loader2 className="size-3.5 animate-spin text-primary" />
            ) : (
              <Navigation className={cn("size-3.5", isProximityActive ? "text-primary" : "text-subtle-foreground")} />
            )}
            <span>{isLocating ? "Localizando..." : "Perto de mim"}</span>
          </motion.button>
        )}

        <motion.button
          type="button"
          onClick={onOpenFilters}
          whileTap={{ scale: 0.96 }}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-surface px-4 text-sm font-semibold text-foreground transition-colors hover:bg-muted lg:ml-1 lg:h-10 lg:rounded-full"
        >
          <SlidersHorizontal className="size-4" aria-hidden />
          <span>Filtros</span>
          {activeFilterCount > 0 && (
            <span className="grid size-5 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {activeFilterCount}
            </span>
          )}
        </motion.button>
      </form>
    </motion.section>
  )
}