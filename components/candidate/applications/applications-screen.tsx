"use client"

import { useMemo, useState } from "react"
import { ROUTES } from "@/lib/config/routes"
import Link from "next/link"
import {
  ChevronRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  Building2,
  Sparkles,
} from "lucide-react"
import { PageShell, PageHeader, Section } from "@/components/ui/page"
import { CardSkeleton, EmptyState, ErrorState } from "@/components/ui/states"
import { EntityAvatar } from "@/components/ui/entity-avatar"
import {
  EtapaProgresso,
  FeedbackCount,
  StatusBadge,
} from "@/components/shared/candidatura/candidatura-ui"
import { useMinhasCandidaturas } from "@/lib/queries/use-candidaturas"
import { formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"
import {
  STATUS_LABELS,
  type Candidatura,
  type StatusCandidatura,
} from "@/lib/types/candidatura.types"

const FILTROS = [
  { id: "TODAS", label: "Todas" },
  { id: "EM_ANDAMENTO", label: STATUS_LABELS.EM_ANDAMENTO },
  { id: "APROVADA", label: STATUS_LABELS.APROVADA },
  { id: "REPROVADA", label: STATUS_LABELS.REPROVADA },
  { id: "CANCELADA", label: STATUS_LABELS.CANCELADA },
] as const

type FiltroId = (typeof FILTROS)[number]["id"]

const STATUS_DOT: Record<StatusCandidatura, string> = {
  EM_ANDAMENTO: "bg-primary",
  APROVADA:     "bg-success",
  REPROVADA:    "bg-danger",
  CANCELADA:    "bg-border-strong",
}

// ─── Card de candidatura ─────────────────────────────────────────────────────

function ApplicationCard({ candidatura }: { candidatura: Candidatura }) {
  const company = candidatura.nomeEmpresa ?? "Empresa confidencial"

  return (
    <li className="group">
      <Link
        href={ROUTES.candidate.application(candidatura.id)}
        className="flex items-center gap-4 px-5 py-4 transition-colors duration-150 hover:bg-surface sm:px-6 sm:gap-5"
      >
        {/* Avatar */}
        <EntityAvatar name={company} size="md" className="shrink-0" />

        {/* Info principal */}
        <div className="min-w-0 flex-1">
          {/* Empresa + status na mesma linha */}
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-0.5">
            <p className="truncate text-xs font-medium text-muted-foreground">
              {company}
            </p>
            {/* Status: dot semântico + badge */}
            <div className="flex shrink-0 items-center gap-1.5">
              <span
                className={cn("size-1.5 shrink-0 rounded-full", STATUS_DOT[candidatura.status])}
                aria-hidden
              />
              <StatusBadge status={candidatura.status} size="sm" />
            </div>
          </div>

          {/* Cargo */}
          <h3 className="mt-0.5 truncate text-sm font-semibold text-foreground">
            {candidatura.vagaTitulo}
          </h3>

          {/* Etapa + feedbacks */}
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
            <EtapaProgresso
              etapa={candidatura.etapaAtual}
              status={candidatura.status}
              etapasVaga={candidatura.etapasVaga}
            />
            <FeedbackCount total={candidatura.totalFeedbacks ?? 0} />
          </div>

          {/* Data */}
          {candidatura.createdAt && (
            <p className="mt-1.5 text-[11px] text-subtle-foreground">
              Enviada em <time>{formatDate(candidatura.createdAt)}</time>
            </p>
          )}
        </div>

        {/* Chevron */}
        <ChevronRight
          className={cn(
            "size-4 shrink-0 text-subtle-foreground",
            "opacity-0 transition-opacity duration-150 group-hover:opacity-100",
            "sm:opacity-50 group-hover:sm:text-primary",
          )}
          aria-hidden
        />
      </Link>
    </li>
  )
}

// ─── Stats em linha ───────────────────────────────────────────────────────────

function StatRow({
  stats,
  loading,
}: {
  stats: { label: string; value: number; icon: React.ComponentType<{ className?: string }>; accent: string }[]
  loading: boolean
}) {
  return (
    <dl className="grid gap-3 sm:grid-cols-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex items-center gap-3 rounded-card border border-border bg-card px-5 py-4 shadow-card"
        >
          {/* Ícone com cor da paleta Selecta */}
          <span className={cn("grid size-9 shrink-0 place-items-center rounded-xl", stat.accent)}>
            <stat.icon className="size-4" aria-hidden />
          </span>
          <div>
            <dt className="text-xs font-medium text-muted-foreground">{stat.label}</dt>
            <dd className="mt-0.5 text-2xl font-bold tabular-nums tracking-tight text-foreground">
              {loading ? (
                <span className="inline-block h-7 w-10 animate-pulse rounded-md bg-border" aria-hidden />
              ) : (
                stat.value
              )}
            </dd>
          </div>
        </div>
      ))}
    </dl>
  )
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export function ApplicationsScreen() {
  const { candidaturas, loading, error, refetch } = useMinhasCandidaturas()
  const [filtro, setFiltro] = useState<FiltroId>("TODAS")

  const contagem = useMemo(() => {
    const base: Record<FiltroId, number> = {
      TODAS: candidaturas.length,
      EM_ANDAMENTO: 0,
      APROVADA: 0,
      REPROVADA: 0,
      CANCELADA: 0,
    }
    candidaturas.forEach((item) => {
      base[item.status] += 1
    })
    return base
  }, [candidaturas])

  const resultados = useMemo(
    () =>
      filtro === "TODAS"
        ? candidaturas
        : candidaturas.filter((item) => item.status === (filtro as StatusCandidatura)),
    [candidaturas, filtro],
  )

  const stats = [
    {
      label:  "Candidaturas",
      value:  contagem.TODAS,
      icon:   Building2,
      accent: "bg-primary-subtle text-primary-subtle-foreground",
    },
    {
      label:  "Em andamento",
      value:  contagem.EM_ANDAMENTO,
      icon:   Clock,
      accent: "bg-warning-subtle text-warning-foreground",
    },
    {
      label:  "Aprovações",
      value:  contagem.APROVADA,
      icon:   CheckCircle2,
      accent: "bg-success-subtle text-success-foreground",
    },
  ]

  return (
    <PageShell className="max-w-[1080px]">
      <PageHeader
        eyebrow="Sua jornada"
        title="Candidaturas"
        description="Acompanhe cada etapa dos processos seletivos em que você está participando."
      />

      <div className="mt-8 flex flex-col gap-8">
        {error ? (
          <ErrorState
            description={error}
            action={
              <button type="button" onClick={() => void refetch()} className="btn-primary">
                Tentar novamente
              </button>
            }
          />
        ) : (
          <>
            {/* Métricas */}
            <StatRow stats={stats} loading={loading} />

            {/* Processos */}
            <Section>
              {/* Cabeçalho: título + filtros */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold tracking-tight text-foreground">
                    Processos seletivos
                  </h2>
                  {!loading && (
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {resultados.length}{" "}
                      {resultados.length === 1 ? "processo encontrado" : "processos encontrados"}
                    </p>
                  )}
                </div>

                {/* Filter chips — usa tokens da Selecta */}
                <div className="no-scrollbar flex gap-1.5 overflow-x-auto pb-0.5">
                  {FILTROS.map((item) => {
                    const active = filtro === item.id
                    const total  = contagem[item.id]

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setFiltro(item.id)}
                        aria-pressed={active}
                        className={cn(
                          "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors duration-150",
                          active
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-card text-muted-foreground hover:border-border-strong hover:bg-surface hover:text-strong-foreground",
                        )}
                      >
                        {item.label}
                        <span
                          className={cn(
                            "tabular-nums rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                            active
                              ? "bg-primary-hover text-primary-foreground"
                              : "bg-border text-muted-foreground",
                          )}
                        >
                          {total}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Lista */}
              {loading ? (
                <CardSkeleton rows={3} />
              ) : resultados.length > 0 ? (
                <div className="overflow-hidden rounded-card border border-border bg-card shadow-card">
                  <ul className="divide-y divide-border-subtle">
                    {resultados.map((candidatura) => (
                      <ApplicationCard key={candidatura.id} candidatura={candidatura} />
                    ))}
                  </ul>
                </div>
              ) : candidaturas.length > 0 ? (
                <EmptyState
                  icon={TrendingUp}
                  title="Nenhuma candidatura nesta situação"
                  description="Troque o filtro para ver os outros processos."
                  action={
                    <button
                      type="button"
                      onClick={() => setFiltro("TODAS")}
                      className="btn-primary"
                    >
                      Ver todas
                    </button>
                  }
                />
              ) : (
                <EmptyState
                  icon={Sparkles}
                  title="Sua jornada começa aqui"
                  description="Explore as vagas disponíveis e candidate-se à sua primeira oportunidade."
                  action={
                    <Link href={ROUTES.candidate.overview} className="btn-primary">
                      Explorar vagas
                    </Link>
                  }
                />
              )}
            </Section>
          </>
        )}
      </div>
    </PageShell>
  )
}
