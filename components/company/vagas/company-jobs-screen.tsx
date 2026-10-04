"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { BriefcaseBusiness, Plus, Search } from "lucide-react"

import { useCompanyVagas, useDeleteVaga, useUpdateVaga } from "@/lib/queries/use-vagas"
import { getErrorMessage } from "@/lib/errors"
import type { Vaga } from "@/lib/types/vaga.types"
import { PageShell } from "@/components/ui/page"
import { InputWithIcon } from "@/components/ui/form-field"
import { Alert, CardSkeleton, EmptyState } from "@/components/ui/states"
import { VagaRow } from "./vaga-row"

export function CompanyJobsScreen() {
  const { vagas, loading, error } = useCompanyVagas()
  const deleteVaga = useDeleteVaga()
  const toggleVaga = useUpdateVaga({ silent: true })

  const [query, setQuery] = useState("")
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return vagas

    return vagas.filter((vaga: Vaga) =>
      `${vaga.titulo} ${vaga.cidade} ${vaga.estado}`.toLowerCase().includes(term)
    )
  }, [vagas, query])

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

  return (
    <PageShell className="max-w-[1380px] py-8">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-border pb-8 sm:flex-row sm:items-end">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Recrutamento
          </span>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Vagas
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Publique oportunidades e gerencie suas vagas ativas ou pausadas.
          </p>
        </div>

        <Link
          href="/empresa/vagas/nova"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-all duration-200 hover:opacity-95 "
        >
          <Plus className="size-4" aria-hidden />
          Nova vaga
        </Link>
      </div>

      {/* Alertas */}
      <div className="mt-6 flex flex-col gap-3">
        {error && <Alert tone="danger">{error}</Alert>}
        {actionError && <Alert tone="danger">{actionError}</Alert>}
      </div>

      {/* Busca e total de resultados */}
      <div className="mt-6 flex flex-col gap-4 rounded-xl border border-border bg-card p-4  sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <InputWithIcon
          icon={Search}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar por título, cidade ou estado"
          aria-label="Buscar vaga"
          wrapperClassName="w-full sm:max-w-md"
        />

        <p className="text-xs font-medium text-muted-foreground">
          <span className="font-semibold tabular-nums text-foreground">{filtered.length}</span>{" "}
          {filtered.length === 1 ? "vaga listada" : "vagas listadas"}
        </p>
      </div>

      {/* Lista de Vagas */}
      <div className="mt-6 overflow-hidden rounded-xl border border-border bg-card ">
        {loading ? (
          <div className="p-6">
            <CardSkeleton rows={4} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12">
            <EmptyState
              icon={BriefcaseBusiness}
              title={query ? "Nenhuma vaga encontrada" : "Nenhuma vaga publicada"}
              description={
                query
                  ? "Tente outro termo de busca ou limpe o filtro atual."
                  : "Publique sua primeira oportunidade para começar a receber candidaturas."
              }
              action={
                query ? (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="inline-flex h-9 items-center rounded-full border border-border-subtle/80 bg-background px-4 text-xs font-medium text-foreground transition-all hover:border-border "
                  >
                    Limpar busca
                  </button>
                ) : (
                  <Link
                    href="/empresa/vagas/nova"
                    className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-xs font-medium text-primary-foreground transition-all hover:opacity-95 "
                  >
                    <Plus className="size-3.5" aria-hidden />
                    Nova vaga
                  </Link>
                )
              }
              className="border-0 bg-transparent"
            />
          </div>
        ) : (
          <ul className="divide-y divide-border-subtle/50">
            {filtered.map((vaga: Vaga) => (
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
        )}
      </div>

    </PageShell>
  )
}
