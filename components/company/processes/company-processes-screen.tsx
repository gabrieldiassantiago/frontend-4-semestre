"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  BriefcaseBusiness,
  ChevronRight,
  Inbox,
  MapPin,
  RefreshCw,
  Search,
  Users,
} from "lucide-react"
import { PageHeader, PageShell } from "@/components/ui/page"
import { Badge } from "@/components/ui/badge"
import { EntityAvatar } from "@/components/ui/entity-avatar"
import { InputWithIcon } from "@/components/ui/form-field"
import { VagaSelectionSkeleton, KanbanSkeleton, EmptyState, ErrorState } from "@/components/ui/states"
import { StatusBadge } from "@/components/candidatura/candidatura-ui"
import { useCandidaturasEmpresa } from "@/lib/hooks/useCandidaturas"
import { useCompanyVagas } from "@/lib/hooks/useCompanyVagas"
import {
  ETAPAS,
  ETAPA_DOT,
  ETAPA_LABELS,
  type Candidatura,
  type StatusCandidatura,
} from "@/lib/types/candidatura.types"
import { MODALIDADE_LABELS, NIVEL_LABELS, type Vaga } from "@/lib/types/vaga.types"
import { cn } from "@/lib/utils"

// ─── Tela 1: Seleção de Vaga ───────────────────────────────────────────────

function VagaSelectionScreen({
  vagas,
  loading,
  onSelect,
}: {
  vagas: Vaga[]
  loading: boolean
  onSelect: (vaga: Vaga) => void
}) {
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return vagas
    return vagas.filter((v) =>
      `${v.titulo} ${v.cidade} ${v.estado}`.toLowerCase().includes(term),
    )
  }, [vagas, query])

  return (
    <PageShell className="max-w-4xl py-8">
      <PageHeader
        eyebrow="Pipeline"
        title="Processos seletivos"
        description="Selecione uma vaga para visualizar o funil de candidaturas."
      />

      <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-border-subtle/70 bg-card/60 p-4 backdrop-blur-sm sm:flex-row sm:items-center sm:px-6">
        <InputWithIcon
          icon={Search}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar vaga por título ou cidade"
          aria-label="Buscar vaga"
          wrapperClassName="w-full sm:flex-1"
        />
        <p className="text-xs font-medium text-muted-foreground shrink-0">
          <span className="font-semibold tabular-nums text-foreground">{filtered.length}</span>{" "}
          {filtered.length === 1 ? "vaga" : "vagas"}
        </p>
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="rounded-2xl border border-border-subtle/70 bg-card/60 p-6">
            <VagaSelectionSkeleton rows={3} />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={BriefcaseBusiness}
            title={query ? "Nenhuma vaga encontrada" : "Nenhuma vaga publicada"}
            description={
              query
                ? "Tente outro termo de busca."
                : "Publique vagas para começar a receber candidaturas."
            }
          />
        ) : (
          <ul className="space-y-3">
            {filtered.map((vaga) => (
              <li key={vaga.id}>
                <button
                  type="button"
                  onClick={() => onSelect(vaga)}
                  className="group w-full rounded-2xl border border-border-subtle/70 bg-card/60 p-5 text-left backdrop-blur-sm transition-all hover:border-primary/30 hover:bg-card hover:shadow-md active:scale-[0.99]"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                        <BriefcaseBusiness className="size-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary">
                          {vaga.titulo}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="size-3 shrink-0" />
                            {vaga.cidade} — {vaga.estado}
                          </span>
                          <span>•</span>
                          <span>{MODALIDADE_LABELS[vaga.modalidade]}</span>
                          <span>•</span>
                          <span>{NIVEL_LABELS[vaga.nivelExperiencia]}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-3">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
                          vaga.ativa
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        <span
                          className={cn(
                            "size-1.5 rounded-full",
                            vaga.ativa ? "bg-emerald-500" : "bg-muted-foreground",
                          )}
                        />
                        {vaga.ativa ? "Ativa" : "Pausada"}
                      </span>
                      <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </PageShell>
  )
}

// ─── Tela 2: Kanban de uma vaga específica ─────────────────────────────────

function VagaKanbanScreen({
  vaga,
  onBack,
}: {
  vaga: Vaga
  onBack: () => void
}) {
  const [busca, setBusca] = useState("")
  const [status, setStatus] = useState<StatusCandidatura | "">("")

  const filters = useMemo(
    () => ({ vagaId: vaga.id, status: status || undefined }),
    [vaga.id, status],
  )

  const { candidaturas, loading, refreshing, error, refetch } = useCandidaturasEmpresa(filters)

  const visiveis = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    if (!termo) return candidaturas
    return candidaturas.filter((item) =>
      [item.candidatoNome, item.candidatoEmail]
        .filter(Boolean)
        .some((campo) => (campo as string).toLowerCase().includes(termo)),
    )
  }, [candidaturas, busca])

  const colunas = useMemo(() => {
    const map = new Map<string, Candidatura[]>(ETAPAS.map((etapa) => [etapa, []]))
    visiveis.forEach((item) => map.get(item.etapaAtual)?.push(item))
    return map
  }, [visiveis])

  const temFiltro = Boolean(busca.trim()) || status !== ""

  return (
    <PageShell>
      {/* Header com breadcrumb de volta */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={onBack}
            aria-label="Voltar para lista de vagas"
            className="mt-1 grid size-8 shrink-0 place-items-center rounded-full border border-border-subtle/80 text-muted-foreground transition-all hover:border-border hover:bg-muted hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
          </button>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Pipeline · Processos seletivos
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground truncate">
              {vaga.titulo}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3" /> {vaga.cidade} — {vaga.estado}
              </span>
              <span>•</span>
              <span>{MODALIDADE_LABELS[vaga.modalidade]}</span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
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
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col gap-3 rounded-card border border-border bg-card p-4 shadow-card sm:flex-row sm:items-center">
        <InputWithIcon
          icon={Search}
          type="search"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar candidato pelo nome"
          aria-label="Buscar candidato"
          wrapperClassName="sm:flex-1"
        />
        <select
          className="field-input sm:w-44"
          value={status}
          onChange={(e) => setStatus(e.target.value as StatusCandidatura | "")}
          aria-label="Filtrar por situação"
        >
          <option value="">Todas as situações</option>
          <option value="EM_ANDAMENTO">Em andamento</option>
          <option value="APROVADA">Aprovados</option>
          <option value="REPROVADA">Reprovados</option>
        </select>
      </div>

      {/* Estado de carregamento / erro / vazio / kanban */}
      {loading ? (
        <div className="mt-6">
          <KanbanSkeleton />
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
          title={temFiltro ? "Nenhuma candidatura com esses filtros" : "Nenhuma candidatura ainda"}
          description={
            temFiltro
              ? "Ajuste os filtros para ver outros candidatos."
              : "Quando alguém se candidatar a esta vaga, o processo aparece aqui."
          }
          action={
            temFiltro ? (
              <button
                type="button"
                onClick={() => {
                  setStatus("")
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
        <div className="mt-6 -mx-4 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
          <div className="flex min-w-max gap-3 lg:min-w-0">
            {ETAPAS.map((etapa) => {
              const items = colunas.get(etapa) ?? []
              const isEmpty = items.length === 0

              return (
                <section
                  key={etapa}
                  className={cn(
                    "flex w-64 shrink-0 flex-col rounded-2xl border bg-card shadow-card lg:w-auto lg:flex-1",
                    isEmpty ? "border-border-subtle/50" : "border-border",
                  )}
                >
                  {/* Cabeçalho da coluna */}
                  <div className="flex items-center justify-between gap-2 border-b border-border-subtle px-3 py-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className={cn("size-2 shrink-0 rounded-full", ETAPA_DOT[etapa])}
                        aria-hidden
                      />
                      <h2 className="truncate text-xs font-bold tracking-tight text-foreground">
                        {ETAPA_LABELS[etapa]}
                      </h2>
                    </div>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-bold tabular-nums",
                        isEmpty
                          ? "bg-muted/60 text-muted-foreground"
                          : "bg-primary/10 text-primary",
                      )}
                    >
                      {items.length}
                    </span>
                  </div>

                  {/* Cards */}
                  {isEmpty ? (
                    <p className="px-3 py-5 text-center text-xs text-muted-foreground/60">
                      Vazio
                    </p>
                  ) : (
                    <ul className="flex flex-col gap-2 p-2.5">
                      {items.map((item) => (
                        <li key={item.id}>
                          <Link
                            href={`/empresa/candidatos/${encodeURIComponent(item.id)}`}
                            className={cn(
                              "flex w-full items-center gap-2.5 rounded-xl border p-2.5 text-left transition-all hover:shadow-sm active:scale-[0.98]",
                              "border-border-subtle/70 bg-muted/40 hover:border-border hover:bg-muted/60",
                            )}
                          >
                            <EntityAvatar name={item.candidatoNome} size="sm" />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-xs font-semibold text-foreground">
                                {item.candidatoNome ?? "Candidato"}
                              </p>
                              <div className="mt-1">
                                <StatusBadge status={item.status} size="sm" />
                              </div>
                            </div>
                          </Link>
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


    </PageShell>
  )
}

// ─── Componente principal (orquestra as duas telas) ────────────────────────

export function CompanyProcessesScreen({ vagaId }: { vagaId?: string }) {
  const { vagas, loading } = useCompanyVagas()
  const router = useRouter()
  const vagaSelecionada = vagas.find(vaga => vaga.id === vagaId)

  if (vagaSelecionada) {
    return (
      <VagaKanbanScreen
        vaga={vagaSelecionada}
        onBack={() => router.push("/empresa/processos")}
      />
    )
  }

  return (
    <VagaSelectionScreen
      vagas={vagas}
      loading={loading}
      onSelect={vaga => router.push(`/empresa/processos?vaga=${encodeURIComponent(vaga.id)}`)}
    />
  )
}
