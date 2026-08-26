"use client"

import { useEffect, useId, useRef, useState } from "react"
import {
  Check,
  ChevronDown,
  Layers,
  MapPin,
  Search,
  SlidersHorizontal,
} from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"

import { cn } from "@/lib/utils"
import {
  CATEGORIA_LABELS,
  type VagaCategoria,
} from "@/lib/types/vaga.types"

export interface JobSearchState {
  query: string
  categoria: VagaCategoria | "TODAS"
  local: string
}

export const EMPTY_SEARCH: JobSearchState = {
  query: "",
  categoria: "TODAS",
  local: "",
}

const SUGGESTIONS = [
  "Desenvolvedor",
  "Design UX/UI",
  "Dados",
  "Marketing",
  "Vendas",
]

const CATEGORIAS = Object.entries(CATEGORIA_LABELS) as [
  VagaCategoria,
  string,
][]

export function JobSearchBar({
  value,
  onSubmit,
  onOpenFilters,
  activeFilterCount,
}: {
  value: JobSearchState
  onSubmit: (next: JobSearchState) => void
  onOpenFilters: () => void
  activeFilterCount: number
}) {
  const [draft, setDraft] = useState(value)
  const [categoryOpen, setCategoryOpen] = useState(false)

  const categoryRef = useRef<HTMLDivElement>(null)

  const queryId = useId()
  const categoriaId = useId()
  const localId = useId()

  useEffect(() => {
    setDraft(value)
  }, [value])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        categoryRef.current &&
        !categoryRef.current.contains(event.target as Node)
      ) {
        setCategoryOpen(false)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setCategoryOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleEscape)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [])

  const update = <K extends keyof JobSearchState>(
    key: K,
    next: JobSearchState[K],
  ) => {
    setDraft((current) => ({
      ...current,
      [key]: next,
    }))
  }

  const selectedCategoryLabel =
    draft.categoria === "TODAS"
      ? "Todas as áreas"
      : CATEGORIA_LABELS[draft.categoria]

  return (
    <section
      aria-label="Buscar vagas"
      className="rounded-panel border border-border bg-card p-3 shadow-card sm:p-4"
    >
      <form
        onSubmit={(event) => {
          event.preventDefault()
          onSubmit(draft)
        }}
        className="flex flex-col gap-2.5 lg:flex-row lg:items-center"
      >
        {/* Busca */}
        <div className="relative flex-1">
          <label htmlFor={queryId} className="sr-only">
            Cargo, empresa ou palavra-chave
          </label>

          <Search
            className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-subtle-foreground"
            aria-hidden
          />

          <input
            id={queryId}
            type="search"
            value={draft.query}
            onChange={(event) => update("query", event.target.value)}
            placeholder="Encontre uma vaga"
            className="h-12 w-full rounded-xl bg-surface pl-12 pr-4 text-sm text-foreground outline-none transition-all duration-200 placeholder:text-subtle-foreground focus:bg-background focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {/* Categoria */}
        <div
          ref={categoryRef}
          className="relative lg:w-60"
        >
          <label
            id={`${categoriaId}-label`}
            className="sr-only"
          >
            Área de atuação
          </label>

          <motion.button
            id={categoriaId}
            type="button"
            aria-labelledby={`${categoriaId}-label`}
            aria-haspopup="listbox"
            aria-expanded={categoryOpen}
            onClick={() =>
              setCategoryOpen((current) => !current)
            }
            whileTap={{ scale: 0.985 }}
            transition={{
              duration: 0.12,
            }}
            className={cn(
              "flex h-12 w-full items-center gap-3 rounded-xl border px-3 text-left outline-none",
              "transition-colors duration-200",
              categoryOpen
                ? "border-border-strong bg-background shadow-sm ring-2 ring-primary/20"
                : "border-transparent bg-surface hover:bg-muted",
            )}
          >
            <motion.div
              animate={{
                scale: categoryOpen ? 1.05 : 1,
              }}
              transition={{
                duration: 0.18,
                ease: "easeOut",
              }}
              className={cn(
                "grid size-8 shrink-0 place-items-center rounded-lg",
                "bg-background shadow-sm",
                categoryOpen && "bg-primary-subtle",
              )}
            >
              <Layers
                className={cn(
                  "size-4",
                  categoryOpen
                    ? "text-primary"
                    : "text-subtle-foreground",
                )}
                aria-hidden
              />
            </motion.div>

            <div className="min-w-0 flex-1">
              <span className="block text-[10px] font-medium leading-none text-muted-foreground">
                Área
              </span>

              <AnimatePresence mode="wait">
                <motion.span
                  key={selectedCategoryLabel}
                  initial={{
                    opacity: 0,
                    y: 3,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    y: -3,
                  }}
                  transition={{
                    duration: 0.14,
                  }}
                  className="mt-1 block truncate text-sm font-semibold leading-none text-foreground"
                >
                  {selectedCategoryLabel}
                </motion.span>
              </AnimatePresence>
            </div>

            <motion.div
              animate={{
                rotate: categoryOpen ? 180 : 0,
              }}
              transition={{
                duration: 0.2,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <ChevronDown
                className="size-4 shrink-0 text-muted-foreground"
                aria-hidden
              />
            </motion.div>
          </motion.button>

          <AnimatePresence>
            {categoryOpen && (
              <motion.div
                role="listbox"
                aria-labelledby={`${categoriaId}-label`}
                initial={{
                  opacity: 0,
                  y: -8,
                  scale: 0.97,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  y: -6,
                  scale: 0.98,
                }}
                transition={{
                  duration: 0.2,
                  ease: [0.22, 1, 0.36, 1],
                }}
                style={{
                  transformOrigin: "top center",
                }}
                className="absolute left-0 top-[calc(100%+10px)] z-50 w-full min-w-[290px] overflow-hidden rounded-2xl border border-border bg-background p-2 shadow-[0_18px_50px_rgba(0,0,0,0.14)]"
              >
                <motion.div
                  initial={{
                    opacity: 0,
                    y: -3,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.18,
                    delay: 0.03,
                  }}
                  className="px-2 pb-2 pt-1"
                >
                  <p className="text-sm font-semibold text-foreground">
                    Área de atuação
                  </p>

                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Escolha a categoria das vagas
                  </p>
                </motion.div>

                <div className="border-t border-border-subtle pt-2">
                  <motion.button
                    type="button"
                    role="option"
                    aria-selected={
                      draft.categoria === "TODAS"
                    }
                    initial={{
                      opacity: 0,
                      y: 5,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      duration: 0.16,
                      delay: 0.04,
                    }}
                    whileHover={{
                      x: 2,
                    }}
                    whileTap={{
                      scale: 0.99,
                    }}
                    onClick={() => {
                      update("categoria", "TODAS")
                      setCategoryOpen(false)
                    }}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left",
                      "transition-colors duration-150",
                      draft.categoria === "TODAS"
                        ? "bg-primary-subtle"
                        : "hover:bg-muted",
                    )}
                  >
                    <div
                      className={cn(
                        "grid size-9 shrink-0 place-items-center rounded-xl",
                        draft.categoria === "TODAS"
                          ? "bg-background text-primary shadow-sm"
                          : "bg-surface text-muted-foreground",
                      )}
                    >
                      <Layers className="size-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          "text-sm",
                          draft.categoria === "TODAS"
                            ? "font-semibold text-primary"
                            : "font-medium text-foreground",
                        )}
                      >
                        Todas as áreas
                      </p>

                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Ver vagas de qualquer categoria
                      </p>
                    </div>

                    <AnimatePresence>
                      {draft.categoria === "TODAS" && (
                        <motion.div
                          initial={{
                            opacity: 0,
                            scale: 0.5,
                          }}
                          animate={{
                            opacity: 1,
                            scale: 1,
                          }}
                          exit={{
                            opacity: 0,
                            scale: 0.5,
                          }}
                          transition={{
                            duration: 0.15,
                          }}
                          className="grid size-6 shrink-0 place-items-center rounded-full bg-primary"
                        >
                          <Check
                            className="size-3.5 text-primary-foreground"
                            strokeWidth={3}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>

                  <div className="mt-1 max-h-72 space-y-1 overflow-y-auto">
                    {CATEGORIAS.map(
                      ([categoryValue, label], index) => {
                        const selected =
                          draft.categoria === categoryValue

                        return (
                          <motion.button
                            key={categoryValue}
                            type="button"
                            role="option"
                            aria-selected={selected}
                            initial={{
                              opacity: 0,
                              y: 6,
                            }}
                            animate={{
                              opacity: 1,
                              y: 0,
                            }}
                            transition={{
                              duration: 0.15,
                              delay: 0.06 + index * 0.025,
                            }}
                            whileHover={{
                              x: 3,
                            }}
                            whileTap={{
                              scale: 0.99,
                            }}
                            onClick={() => {
                              update(
                                "categoria",
                                categoryValue,
                              )
                              setCategoryOpen(false)
                            }}
                            className={cn(
                              "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left",
                              "transition-colors duration-150",
                              selected
                                ? "bg-primary-subtle"
                                : "hover:bg-muted",
                            )}
                          >
                            <motion.div
                              animate={{
                                scale: selected ? 1.04 : 1,
                              }}
                              transition={{
                                duration: 0.15,
                              }}
                              className={cn(
                                "grid size-9 shrink-0 place-items-center rounded-xl",
                                selected
                                  ? "bg-background text-primary shadow-sm"
                                  : "bg-surface text-muted-foreground",
                              )}
                            >
                              <Layers className="size-4" />
                            </motion.div>

                            <span
                              className={cn(
                                "min-w-0 flex-1 truncate text-sm",
                                selected
                                  ? "font-semibold text-primary"
                                  : "font-medium text-foreground",
                              )}
                            >
                              {label}
                            </span>

                            <AnimatePresence>
                              {selected && (
                                <motion.div
                                  initial={{
                                    opacity: 0,
                                    scale: 0.5,
                                  }}
                                  animate={{
                                    opacity: 1,
                                    scale: 1,
                                  }}
                                  exit={{
                                    opacity: 0,
                                    scale: 0.5,
                                  }}
                                  transition={{
                                    duration: 0.15,
                                  }}
                                  className="grid size-6 shrink-0 place-items-center rounded-full bg-primary"
                                >
                                  <Check
                                    className="size-3.5 text-primary-foreground"
                                    strokeWidth={3}
                                  />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.button>
                        )
                      },
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Localização */}
        <div className="relative lg:w-52">
          <label htmlFor={localId} className="sr-only">
            Cidade ou estado
          </label>

          <MapPin
            className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-subtle-foreground"
            aria-hidden
          />

          <input
            id={localId}
            type="text"
            value={draft.local}
            onChange={(event) =>
              update("local", event.target.value)
            }
            placeholder="Cidade ou estado"
            className="h-12 w-full rounded-xl bg-surface pl-12 pr-4 text-sm text-foreground outline-none transition-all duration-200 placeholder:text-subtle-foreground focus:bg-background focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {/* Botão buscar */}
        <motion.button
          type="submit"
          whileHover={{
            scale: 1.015,
          }}
          whileTap={{
            scale: 0.97,
          }}
          transition={{
            duration: 0.12,
          }}
          className="h-12 shrink-0 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          Encontrar vagas
        </motion.button>
      </form>

      {/* Sugestões */}
      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border-subtle pt-3">
        <span className="text-xs font-medium text-muted-foreground">
          Sugestões:
        </span>

        {SUGGESTIONS.map((suggestion) => {
          const active =
            value.query.toLowerCase() ===
            suggestion.toLowerCase()

          return (
            <motion.button
              key={suggestion}
              type="button"
              aria-pressed={active}
              whileHover={{
                y: -1,
              }}
              whileTap={{
                scale: 0.96,
              }}
              transition={{
                duration: 0.12,
              }}
              onClick={() =>
                onSubmit({
                  ...value,
                  query: active ? "" : suggestion,
                })
              }
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                active
                  ? "border-primary bg-primary-subtle text-primary-subtle-foreground"
                  : "border-border text-strong-foreground hover:border-border-strong hover:bg-muted",
              )}
            >
              {suggestion}
            </motion.button>
          )
        })}

        {/* Filtros mobile */}
        <motion.button
          type="button"
          whileTap={{
            scale: 0.96,
          }}
          onClick={onOpenFilters}
          className="ml-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-strong-foreground transition-colors hover:bg-muted lg:hidden"
        >
          <SlidersHorizontal
            className="size-3.5"
            aria-hidden
          />

          Filtros

          <AnimatePresence>
            {activeFilterCount > 0 && (
              <motion.span
                initial={{
                  opacity: 0,
                  scale: 0.5,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.5,
                }}
                className="grid size-4 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground"
              >
                {activeFilterCount}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </section>
  )
}