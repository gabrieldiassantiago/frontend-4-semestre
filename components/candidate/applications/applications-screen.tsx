"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { BriefcaseBusiness, ChevronRight, RefreshCw } from "lucide-react"
import { PageShell, PageHeader, Section } from "@/components/ui/page"
import { CardSkeleton, EmptyState, ErrorState } from "@/components/ui/states"
import { EntityAvatar } from "@/components/ui/entity-avatar"
import {
  EtapaProgresso,
  FeedbackCount,
  StatusBadge,
} from "@/components/candidatura/candidatura-ui"
import { useMinhasCandidaturas } from "@/lib/hooks/useCandidaturas"
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

function ApplicationRow({ candidatura }: { candidatura: Candidatura }) {
  const company = candidatura.nomeEmpresa ?? "Empresa confidencial"

  return (
    <li>
      <Link
        href={`/candidaturas/${candidatura.id}`}
        className="flex flex-col gap-4 p-5 transition-colors hover:bg-muted/60 sm:flex-row sm:items-center sm:gap-5"
      >
        <EntityAvatar name={company} size="md" />

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-bold text-foreground">{candidatura.vagaTitulo}</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {company}
            {candidatura.createdAt && ` · candidatura em ${formatDate(candidatura.createdAt)}`}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
            <EtapaProgresso etapa={candidatura.etapaAtual} status={candidatura.status} />
            <FeedbackCount total={candidatura.totalFeedbacks ?? 0} />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <StatusBadge status={candidatura.status} />
          <ChevronRight className="size-4 shrink-0 text-subtle-foreground" aria-hidden />
        </div>
      </Link>
    </li>
  )
}

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
    { label: "Total de candidaturas", value: contagem.TODAS },
    { label: "Em andamento", value: contagem.EM_ANDAMENTO },
    {
      label: "Feedbacks recebidos",
      value: candidaturas.reduce((total, item) => total + (item.totalFeedbacks ?? 0), 0),
    },
  ]

  return (
    <PageShell className="max-w-[1080px]">
      <PageHeader
        eyebrow="Sua jornada"
        title="Candidaturas"
        description="Acompanhe cada etapa dos processos seletivos em que você está participando."
        actions={
          <button
            type="button"
            onClick={() => void refetch()}
            className="btn-secondary"
            aria-label="Atualizar candidaturas"
          >
            <RefreshCw className="size-4" aria-hidden />
            Atualizar
          </button>
        }
      />

      <div className="mt-8 flex flex-col gap-6">
        {error ? (
          <ErrorState
            description={error}
            action={
              <button type="button" onClick={() => void refetch()} className="btn-primary">
                <RefreshCw className="size-4" aria-hidden />
                Tentar novamente
              </button>
            }
          />
        ) : (
          <>
            <dl className="grid gap-4 sm:grid-cols-3">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-card border border-border bg-card p-5 shadow-card"
                >
                  <dt className="text-xs font-semibold text-muted-foreground">{stat.label}</dt>
                  <dd className="mt-2 text-3xl font-bold tracking-tight tabular-nums text-foreground">
                    {loading ? "—" : stat.value}
                  </dd>
                </div>
              ))}
            </dl>

            <Section title="Processos">
              <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
                {FILTROS.map((item) => {
                  const active = filtro === item.id
                  const total = contagem[item.id]

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setFiltro(item.id)}
                      aria-pressed={active}
                      className={cn(
                        "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-bold transition-colors",
                        active
                          ? "border-primary bg-primary-subtle text-primary-subtle-foreground"
                          : "border-border text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      {item.label}
                      <span className="tabular-nums opacity-70">{total}</span>
                    </button>
                  )
                })}
              </div>

              {loading ? (
                <CardSkeleton rows={3} />
              ) : resultados.length > 0 ? (
                <div className="overflow-hidden rounded-card border border-border bg-card shadow-card">
                  <ul className="divide-y divide-border-subtle">
                    {resultados.map((candidatura) => (
                      <ApplicationRow key={candidatura.id} candidatura={candidatura} />
                    ))}
                  </ul>
                </div>
              ) : candidaturas.length > 0 ? (
                <EmptyState
                  icon={BriefcaseBusiness}
                  title="Nenhuma candidatura nesta situação"
                  description="Troque o filtro para ver os outros processos."
                  action={
                    <button type="button" onClick={() => setFiltro("TODAS")} className="btn-primary">
                      Ver todas
                    </button>
                  }
                />
              ) : (
                <EmptyState
                  icon={BriefcaseBusiness}
                  title="Você ainda não se candidatou"
                  description="Explore as vagas disponíveis e candidate-se à primeira oportunidade."
                  action={
                    <Link href="/dashboard" className="btn-primary">
                      Ver vagas
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
