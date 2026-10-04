"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { BriefcaseBusiness, Plus, Search } from "lucide-react"
import { InputWithIcon } from "@/components/ui/form-field"
import { PageHeader, PageShell } from "@/components/ui/page"
import { Alert, CardSkeleton, EmptyState } from "@/components/ui/states"
import { ROUTES } from "@/lib/config/routes"
import { getErrorMessage } from "@/lib/errors"
import { useCompanyVagas, useDeleteVaga, useUpdateVaga } from "@/lib/queries/use-vagas"
import type { Vaga } from "@/lib/types/vaga.types"
import { cn } from "@/lib/utils"
import { VagaRow } from "./vaga-row"

const STATUS_FILTERS = [
  { id: "all", label: "Todas", match: () => true },
  { id: "active", label: "Publicadas", match: (vaga: Vaga) => vaga.ativa },
  { id: "paused", label: "Pausadas", match: (vaga: Vaga) => !vaga.ativa },
] as const

type StatusFilterId = (typeof STATUS_FILTERS)[number]["id"]

export function CompanyJobsScreen() {
  const { vagas, loading, error } = useCompanyVagas()
  const deleteVaga = useDeleteVaga()
  const toggleVaga = useUpdateVaga({ silent: true })

  const [query, setQuery] = useState("")
  const [status, setStatus] = useState<StatusFilterId>("all")
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const counts = useMemo(
    () => Object.fromEntries(STATUS_FILTERS.map((f) => [f.id, vagas.filter(f.match).length])) as Record<StatusFilterId, number>,
    [vagas],
  )

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    const matchStatus = STATUS_FILTERS.find((f) => f.id === status)!.match
    return vagas.filter(
      (vaga) => matchStatus(vaga) && (!term || `${vaga.titulo} ${vaga.cidade} ${vaga.estado}`.toLowerCase().includes(term)),
    )
  }, [vagas, query, status])

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

  const hasFilters = Boolean(query) || status !== "all"

  return (
    <PageShell className="max-w-[1380px]">
      <PageHeader
        eyebrow="Recrutamento"
        title="Vagas"
        description="Publique oportunidades e gerencie suas vagas ativas ou pausadas."
      />

      {(error || actionError) && (
        <div className="mt-6 flex flex-col gap-3">
          {error && <Alert tone="danger">{error}</Alert>}
          {actionError && <Alert tone="danger">{actionError}</Alert>}
        </div>
      )}

      <div className="mt-8 overflow-hidden rounded-card border border-border bg-card">
        <div className="flex flex-col gap-3 border-b border-border p-3 sm:p-4 md:flex-row md:items-center md:justify-between">
          <div role="tablist" aria-label="Filtrar por status" className="no-scrollbar flex gap-1 overflow-x-auto">
            {STATUS_FILTERS.map((filter) => {
              const selected = status === filter.id
              return (
                <button
                  key={filter.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setStatus(filter.id)}
                  className={cn(
                    "inline-flex min-h-9 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors",
                    selected ? "bg-primary-subtle text-primary-subtle-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {filter.label}
                  <span
                    className={cn(
                      "rounded-full px-1.5 text-xs tabular-nums",
                      selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                    )}
                  >
                    {counts[filter.id]}
                  </span>
                </button>
              )
            })}
          </div>
          <InputWithIcon
            icon={Search}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por título, cidade ou estado"
            aria-label="Buscar vaga"
            wrapperClassName="w-full md:max-w-sm"
          />
        </div>

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
            className="rounded-none border-0"
            action={
              hasFilters ? (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setQuery("")
                    setStatus("all")
                  }}
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
            <ul className="divide-y divide-border-subtle">
              {filtered.map((vaga) => (
                <li key={vaga.id}>
                  <VagaRow
                    vaga={vaga}
                    detailed
                    deleting={deletingId === vaga.id}
                    onDelete={() => void handleDelete(vaga)}
                    onToggleActive={() => void handleToggleActive(vaga)}
                  />
                </li>
              ))}
            </ul>
            <p className="border-t border-border bg-surface px-4 py-3 text-xs text-muted-foreground sm:px-5">
              <span className="font-semibold tabular-nums text-foreground">{filtered.length}</span>{" "}
              {filtered.length === 1 ? "vaga listada" : "vagas listadas"}
            </p>
          </>
        )}
      </div>
    </PageShell>
  )
}
