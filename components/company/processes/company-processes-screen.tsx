"use client"

import { useMemo, useState } from "react"
import { Inbox, RefreshCw, Search, Users } from "lucide-react"
import { PageHeader, PageShell } from "@/components/ui/page"
import { Badge } from "@/components/ui/badge"
import { EntityAvatar } from "@/components/ui/entity-avatar"
import { InputWithIcon } from "@/components/ui/form-field"
import { CardSkeleton, EmptyState, ErrorState } from "@/components/ui/states"
import { Sheet } from "@/components/ui/sheet"
import { StatusBadge } from "@/components/candidatura/candidatura-ui"
import { CandidaturaDetailPanel } from "@/components/company/processes/candidatura-detail-panel"
import { useCandidaturasEmpresa } from "@/lib/hooks/useCandidaturas"
import { useCompanyVagas } from "@/lib/hooks/useCompanyVagas"
import {
  ETAPAS,
  ETAPA_DOT,
  ETAPA_LABELS,
  STATUS_CANDIDATURA,
  STATUS_LABELS,
  type Candidatura,
  type StatusCandidatura,
} from "@/lib/types/candidatura.types"
import { cn } from "@/lib/utils"

/**
 * Funil real das vagas da empresa.
 * As colunas são as 7 etapas do backend, e cada card abre o painel de gestão —
 * a movimentação acontece por ação explícita, não por arrastar, porque cada
 * mudança de etapa é registrada no histórico e visível ao candidato.
 */
export function CompanyProcessesScreen() {
  const [vagaId, setVagaId] = useState("")
  const [status, setStatus] = useState<StatusCandidatura | "">("EM_ANDAMENTO")
  const [busca, setBusca] = useState("")
  const [selecionada, setSelecionada] = useState<string | null>(null)

  const { vagas } = useCompanyVagas()
  const filters = useMemo(
    () => ({
      vagaId: vagaId || undefined,
      status: status || undefined,
    }),
    [vagaId, status],
  )

  const { candidaturas, loading, refreshing, error, refetch } = useCandidaturasEmpresa(filters)

  // O nome é filtrado no cliente para dar resposta imediata enquanto digita;
  // vaga e status vão para a query porque mudam o conjunto retornado.
  const visiveis = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    if (!termo) return candidaturas
    return candidaturas.filter((item) =>
      [item.candidatoNome, item.candidatoEmail, item.vagaTitulo]
        .filter(Boolean)
        .some((campo) => (campo as string).toLowerCase().includes(termo)),
    )
  }, [candidaturas, busca])

  const colunas = useMemo(() => {
    const map = new Map<string, Candidatura[]>(ETAPAS.map((etapa) => [etapa, []]))
    visiveis.forEach((item) => map.get(item.etapaAtual)?.push(item))
    return map
  }, [visiveis])

  const temFiltro = Boolean(vagaId || busca.trim()) || status !== "EM_ANDAMENTO"

  return (
    <PageShell>
      <PageHeader
        eyebrow="Pipeline"
        title="Processos seletivos"
        description="Acompanhe cada candidato nas sete etapas do funil e registre as decisões do processo."
        actions={
          <>
            <Badge variant="neutral">
              {visiveis.length} {visiveis.length === 1 ? "candidatura" : "candidaturas"}
            </Badge>
            <button
              type="button"
              onClick={() => refetch()}
              className="btn-secondary"
              aria-label="Atualizar funil"
            >
              <RefreshCw className={cn("size-4", refreshing && "animate-spin")} aria-hidden />
              Atualizar
            </button>
          </>
        }
      />

      <div className="mt-8 flex flex-col gap-3 rounded-card border border-border bg-card p-4 shadow-card lg:flex-row lg:items-center">
        <InputWithIcon
          icon={Search}
          type="search"
          value={busca}
          onChange={(event) => setBusca(event.target.value)}
          placeholder="Buscar por candidato ou vaga"
          aria-label="Buscar candidato"
          wrapperClassName="lg:flex-1"
        />

        <div className="flex flex-col gap-3 sm:flex-row lg:shrink-0">
          <select
            className="field-input sm:w-56"
            value={vagaId}
            onChange={(event) => setVagaId(event.target.value)}
            aria-label="Filtrar por vaga"
          >
            <option value="">Todas as vagas</option>
            {vagas.map((vaga) => (
              <option key={vaga.id} value={vaga.id}>
                {vaga.titulo}
              </option>
            ))}
          </select>

          <select
            className="field-input sm:w-48"
            value={status}
            onChange={(event) => setStatus(event.target.value as StatusCandidatura | "")}
            aria-label="Filtrar por situação"
          >
            <option value="">Todas as situações</option>
            {STATUS_CANDIDATURA.map((item) => (
              <option key={item} value={item}>
                {STATUS_LABELS[item]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="mt-6">
          <CardSkeleton rows={3} />
        </div>
      ) : error ? (
        <div className="mt-6">
          <ErrorState
            description={error}
            action={
              <button type="button" onClick={() => refetch()} className="btn-secondary">
                Tentar novamente
              </button>
            }
          />
        </div>
      ) : visiveis.length === 0 ? (
        <EmptyState
          className="mt-6"
          icon={temFiltro ? Inbox : Users}
          title={temFiltro ? "Nenhuma candidatura com esses filtros" : "Ainda sem candidaturas"}
          description={
            temFiltro
              ? "Ajuste a vaga, a situação ou a busca para ver outros candidatos."
              : "Quando alguém se candidatar às suas vagas, o processo aparece aqui na etapa de inscrição."
          }
          action={
            temFiltro ? (
              <button
                type="button"
                onClick={() => {
                  setVagaId("")
                  setStatus("EM_ANDAMENTO")
                  setBusca("")
                }}
                className="btn-secondary"
              >
                Limpar filtros
              </button>
            ) : undefined
          }
        />
      ) : (
        <div className="mt-6 -mx-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
          <div className="flex min-w-max gap-4 lg:min-w-0">
            {ETAPAS.map((etapa) => {
              const items = colunas.get(etapa) ?? []

              return (
                <section
                  key={etapa}
                  className="flex w-72 shrink-0 flex-col rounded-card border border-border bg-card shadow-card lg:w-auto lg:flex-1"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-border-subtle px-4 py-3.5">
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className={cn("size-2 shrink-0 rounded-full", ETAPA_DOT[etapa])}
                        aria-hidden
                      />
                      <h2 className="truncate text-sm font-bold tracking-tight text-foreground">
                        {ETAPA_LABELS[etapa]}
                      </h2>
                    </div>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-bold tabular-nums text-strong-foreground">
                      {items.length}
                    </span>
                  </div>

                  {items.length === 0 ? (
                    <p className="px-4 py-6 text-xs leading-relaxed text-subtle-foreground">
                      Ninguém nesta etapa.
                    </p>
                  ) : (
                    <ul className="flex flex-1 flex-col gap-2.5 p-3">
                      {items.map((item) => (
                        <li key={item.id}>
                          <button
                            type="button"
                            onClick={() => setSelecionada(item.id)}
                            className={cn(
                              "flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-colors",
                              selecionada === item.id
                                ? "border-primary bg-primary-subtle"
                                : "border-border-subtle bg-muted/60 hover:border-border hover:bg-muted",
                            )}
                          >
                            <EntityAvatar name={item.candidatoNome} size="sm" />
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-semibold text-foreground">
                                {item.candidatoNome ?? "Candidato"}
                              </span>
                              <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                                {item.vagaTitulo}
                              </span>
                              <span className="mt-2 flex flex-wrap items-center gap-1.5">
                                <StatusBadge status={item.status} size="sm" />
                                {(item.totalFeedbacks ?? 0) > 0 && (
                                  <Badge variant="outline" size="sm">
                                    {item.totalFeedbacks} fb
                                  </Badge>
                                )}
                              </span>
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              )
            })}
          </div>
        </div>
      )}

      <Sheet
        open={Boolean(selecionada)}
        onClose={() => setSelecionada(null)}
        side="right"
        title="Gestão da candidatura"
      >
        {selecionada && <CandidaturaDetailPanel candidaturaId={selecionada} />}
      </Sheet>
    </PageShell>
  )
}
