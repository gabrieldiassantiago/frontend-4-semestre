"use client"

import { Select } from "@/components/ui/select"
import { useMemo, useState } from "react"
import Link from "next/link"
import { BriefcaseBusiness, Plus, Search, X } from "lucide-react"
import { InputWithIcon } from "@/components/ui/form-field"
import { PageHeader, PageShell } from "@/components/ui/page"
import { Alert, CardSkeleton, EmptyState } from "@/components/ui/states"
import { ROUTES } from "@/lib/config/routes"
import { getErrorMessage } from "@/lib/errors"
import { useCompanyVagas, useDeleteVaga, useUpdateVaga } from "@/lib/queries/use-vagas"
import { CATEGORIA_LABELS, MODALIDADE_LABELS, type Vaga, type VagaModalidade } from "@/lib/types/vaga.types"
import { cn } from "@/lib/utils"
import { VagaRow } from "./vaga-row"

const STATUS_FILTERS = [
  { id: "all", label: "Todas", match: () => true },
  { id: "active", label: "Publicadas", match: (vaga: Vaga) => vaga.ativa },
  { id: "paused", label: "Pausadas", match: (vaga: Vaga) => !vaga.ativa },
] as const

type StatusFilterId = (typeof STATUS_FILTERS)[number]["id"]

const MODALIDADE_OPTIONS: VagaModalidade[] = ["PRESENCIAL", "HIBRIDO", "REMOTO"]

const SORT_OPTIONS = [
  { id: "recent", label: "Mais recentes" },
  { id: "oldest", label: "Mais antigas" },
  { id: "salary", label: "Maior salário" },
  { id: "title", label: "Título (A–Z)" },
] as const

type SortId = (typeof SORT_OPTIONS)[number]["id"]

const selectClass =
  "min-h-11 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground transition-colors hover:border-primary-soft focus-visible:outline-primary lg:w-52"

export function CompanyJobsScreen() {
  const { vagas, loading, error } = useCompanyVagas()
  const deleteVaga = useDeleteVaga()
  const toggleVaga = useUpdateVaga({ silent: true })

  const [query, setQuery] = useState("")
  const [status, setStatus] = useState<StatusFilterId>("all")
  const [modalidade, setModalidade] = useState<VagaModalidade | "all">("all")
  const [categoria, setCategoria] = useState<string>("all")
  const [sort, setSort] = useState<SortId>("recent")
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const counts = useMemo(
    () => Object.fromEntries(STATUS_FILTERS.map((f) => [f.id, vagas.filter(f.match).length])) as Record<StatusFilterId, number>,
    [vagas],
  )

  const categorias = useMemo(() => Array.from(new Set(vagas.map((v) => v.categoria))).filter(Boolean), [vagas])

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    const matchStatus = STATUS_FILTERS.find((f) => f.id === status)!.match
    const list = vagas.filter(
      (vaga) =>
        matchStatus(vaga) &&
        (modalidade === "all" || vaga.modalidade === modalidade) &&
        (categoria === "all" || vaga.categoria === categoria) &&
        (!term || `${vaga.titulo} ${vaga.cidade} ${vaga.estado}`.toLowerCase().includes(term)),
    )
    const time = (v: Vaga) => (v.createdAt ? new Date(v.createdAt).getTime() : 0)
    return [...list].sort((a, b) => {
      if (sort === "oldest") return time(a) - time(b)
      if (sort === "salary") return (b.salario || 0) - (a.salario || 0)
      if (sort === "title") return a.titulo.localeCompare(b.titulo, "pt-BR")
      return time(b) - time(a)
    })
  }, [vagas, query, status, modalidade, categoria, sort])

  const clearFilters = () => {
    setQuery("")
    setStatus("all")
    setModalidade("all")
    setCategoria("all")
  }

  const handleDelete = async (vaga: Vaga) => {
    if (!window.confirm(`Remover a vaga "${vaga.titulo}" permanentemente?`)) return
    setActionError(null)
    setDeletingId(vaga.id)
    try {
      await deleteVaga.mutateAsync(vaga.id)
    } catch (err) {
      setActionError(getErrorMessage(err, "Erro ao remover a vaga."))
    } finally {
      setDeletingId(null)
    }
  }

  const handleToggleActive = async (vaga: Vaga) => {
    setActionError(null)
    try {
      await toggleVaga.mutateAsync({ id: vaga.id, dto: { ativa: !vaga.ativa } })
    } catch (err) {
      setActionError(getErrorMessage(err, "Erro ao atualizar a vaga."))
    }
  }

  const hasFilters = Boolean(query) || status !== "all" || modalidade !== "all" || categoria !== "all"

  return (
    <PageShell className="max-w-[1380px]">
      <PageHeader
        className="flex-row items-center justify-between gap-3 sm:items-center [&_h1]:text-ink"
        title="Vagas da empresa"
        actions={<Link href={ROUTES.company.newJob} className="btn-primary rounded-xl px-4"><Plus aria-hidden className="size-4" />Criar vaga</Link>}
      />

      {(error || actionError) && (
        <div className="mt-6 flex flex-col gap-3">
          {error && <Alert tone="danger">{error}</Alert>}
          {actionError && <Alert tone="danger">{actionError}</Alert>}
        </div>
      )}

      <div className="mt-5 sm:mt-6">
        <div className="mb-5 rounded-3xl border border-border bg-card p-3 shadow-card sm:p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <InputWithIcon
              icon={Search}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por título, cidade ou estado"
              aria-label="Buscar vaga"
              wrapperClassName="w-full lg:flex-1"
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:flex">
              <Select
                aria-label="Filtrar por categoria"
                className="lg:w-52"
                value={categoria}
                onValueChange={setCategoria}
                options={[
                  { value: "all", label: "Todas as categorias" },
                  ...categorias.map((c) => ({ value: c, label: CATEGORIA_LABELS[c] ?? c })),
                ]}
              />
              <Select
                aria-label="Ordenar vagas"
                className="lg:w-52"
                value={sort}
                onValueChange={(value) => setSort(value as SortId)}
                options={SORT_OPTIONS.map((o) => ({ value: o.id, label: o.label }))}
              />
            </div>
          </div>

          <div className="mt-3 flex flex-col gap-3 border-t border-border pt-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
              <div role="group" aria-label="Filtrar por status" className="flex max-w-full self-start gap-0.5 rounded-2xl bg-surface p-1">
                {STATUS_FILTERS.map((filter) => {
                  const selected = status === filter.id
                  return (
                    <button
                      key={filter.id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setStatus(filter.id)}
                      className={cn(
                        "inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl px-3 text-xs font-semibold transition-colors focus-visible:outline-primary sm:px-4 sm:text-sm",
                        selected ? "bg-card text-primary-deep shadow-card" : "text-muted-foreground hover:text-primary-deep",
                      )}
                    >
                      {filter.label}
                      <span className={cn("rounded-full px-1.5 text-xs tabular-nums", selected ? "bg-primary-subtle text-primary-subtle-foreground" : "text-muted-foreground")}>
                        {counts[filter.id]}
                      </span>
                    </button>
                  )
                })}
              </div>

              <div role="group" aria-label="Filtrar por modalidade" className="flex flex-wrap items-center gap-2">
                {MODALIDADE_OPTIONS.map((m) => {
                  const selected = modalidade === m
                  return (
                    <button
                      key={m}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setModalidade(selected ? "all" : m)}
                      className={cn(
                        "inline-flex min-h-9 items-center rounded-full border px-3.5 text-xs font-medium transition-colors focus-visible:outline-primary",
                        selected
                          ? "border-primary bg-primary-subtle text-primary-subtle-foreground"
                          : "border-border text-muted-foreground hover:border-primary-soft hover:text-primary-deep",
                      )}
                    >
                      {MODALIDADE_LABELS[m]}
                    </button>
                  )
                })}
              </div>
            </div>

            {hasFilters && (
              <button type="button" onClick={clearFilters} className="inline-flex min-h-9 items-center gap-1.5 self-start rounded-full px-3 text-xs font-semibold text-primary hover:bg-primary-subtle md:self-auto">
                <X className="size-3.5" aria-hidden />
                Limpar filtros
              </button>
            )}
          </div>
        </div>

        {!loading && filtered.length > 0 && (
          <p className="mb-4 text-xs text-muted-foreground" aria-live="polite">
            <span className="font-semibold tabular-nums text-foreground">{filtered.length}</span>{" "}
            {filtered.length === 1 ? "vaga encontrada" : "vagas encontradas"}
            {filtered.length !== vagas.length && <> de {vagas.length}</>}
          </p>
        )}

        {loading ? (
          <div className="p-4 sm:p-6">
            <CardSkeleton rows={4} />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={BriefcaseBusiness}
            title={hasFilters ? "Nenhuma vaga encontrada" : "Nenhuma vaga publicada"}
            description={
              hasFilters
                ? "Tente outro termo de busca ou limpe os filtros atuais."
                : "Publique sua primeira oportunidade para começar a receber candidaturas."
            }
            className="rounded-3xl border border-dashed border-primary-soft bg-card"
            action={
              hasFilters ? (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={clearFilters}
                >
                  Limpar filtros
                </button>
              ) : (
                <Link href={ROUTES.company.newJob} className="btn-primary">
                  <Plus aria-hidden className="size-4" />
                  Nova vaga
                </Link>
              )
            }
          />
        ) : (
          <>
            <ul className="grid items-stretch gap-5 md:grid-cols-2 2xl:grid-cols-3">
              {filtered.map((vaga) => (
                <li key={vaga.id}>
                  <VagaRow
                    vaga={vaga}
                    detailed
                    deleting={deletingId === vaga.id}
                    updating={toggleVaga.isPending && toggleVaga.variables?.id === vaga.id}
                    onDelete={() => void handleDelete(vaga)}
                    onToggleActive={() => void handleToggleActive(vaga)}
                  />
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </PageShell>
  )
}
