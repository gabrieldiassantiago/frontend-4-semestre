"use client"

import { Select } from "@/components/ui/select"
import { useMemo, useState } from "react"
import { ROUTES } from "@/lib/config/routes"
import Link from "next/link"
import { ArrowRight, CalendarDays, Search, SearchX, Sparkles, X } from "lucide-react"
import { PageShell, PageHeader, Section } from "@/components/ui/page"
import { EmptyState, ErrorState } from "@/components/ui/states"
import { CompanyLogo } from "@/components/shared/company-logo"
import { FeedbackCount, StatusBadge } from "@/components/shared/candidatura/candidatura-ui"
import { ApplicationsInsights } from "./applications-insights"
import { useMinhasCandidaturas } from "@/lib/queries/use-candidaturas"
import { formatDate, formatRelativeDate } from "@/lib/format"
import { cn } from "@/lib/utils"
import {
  STATUS_LABELS,
  etapaLabel,
  etapasDaVaga,
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
type Ordem = "recentes" | "antigas" | "atualizadas"

const PROGRESS_TONE: Record<StatusCandidatura, string> = {
  EM_ANDAMENTO: "bg-primary",
  APROVADA: "bg-success",
  REPROVADA: "bg-danger",
  CANCELADA: "bg-border-strong",
}

const RING_TONE: Record<StatusCandidatura, string> = {
  EM_ANDAMENTO: "stroke-primary",
  APROVADA: "stroke-success",
  REPROVADA: "stroke-danger",
  CANCELADA: "stroke-border-strong",
}

function timestamp(value?: string) {
  return value ? new Date(value).getTime() : 0
}

/** Posição do processo: etapas totais, índice atual e fração concluída. */
function getProgress(candidatura: Candidatura) {
  const etapas = etapasDaVaga(candidatura.etapasVaga)
  const current = etapas.indexOf(candidatura.etapaAtual)
  const done = candidatura.status === "APROVADA"
  const fraction = etapas.length === 0 ? 0 : done ? 1 : Math.max(current + 1, 0) / etapas.length
  return { etapas, current, fraction }
}

// ─── Anel de progresso ───────────────────────────────────────────────────────

function ProgressRing({ fraction, status }: { fraction: number; status: StatusCandidatura }) {
  const radius = 20
  const circumference = 2 * Math.PI * radius
  return (
    <div className="relative size-14 shrink-0">
      <svg viewBox="0 0 48 48" className="size-full -rotate-90" aria-hidden>
        <circle cx="24" cy="24" r={radius} fill="none" strokeWidth="5" className="stroke-border" />
        <circle
          cx="24"
          cy="24"
          r={radius}
          fill="none"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={`${fraction * circumference} ${circumference}`}
          className={cn(RING_TONE[status], "transition-[stroke-dasharray] duration-700 ease-out")}
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center text-xs font-bold tabular-nums text-foreground">
        {Math.round(fraction * 100)}%
      </span>
    </div>
  )
}

// ─── Em foco: processos ativos ───────────────────────────────────────────────

function FocusCard({ candidatura }: { candidatura: Candidatura }) {
  const company = candidatura.nomeEmpresa ?? "Empresa confidencial"
  const { etapas, current, fraction } = getProgress(candidatura)
  const stage = etapaLabel(candidatura.etapaAtual, candidatura.etapasVaga)
  const updated = formatRelativeDate(candidatura.updatedAt ?? candidatura.createdAt)

  return (
    <li className="min-w-0">
      <Link
        href={ROUTES.candidate.application(candidatura.id)}
        className="group relative flex h-full flex-col gap-4 overflow-hidden rounded-3xl border border-border/60 bg-card p-5 transition-colors duration-200 hover:border-primary/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <div className="flex items-center gap-3">
          <ProgressRing fraction={fraction} status={candidatura.status} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-muted-foreground">{company}</p>
            <h3 className="truncate text-base font-semibold leading-snug tracking-tight text-foreground">
              {candidatura.vagaTitulo}
            </h3>
          </div>
        </div>
        <div className="mt-auto flex items-center justify-between gap-3 text-xs">
          <div className="min-w-0">
            <p className="truncate font-semibold text-foreground">{stage}</p>
            <p className="mt-0.5 text-muted-foreground">
              {current >= 0 && `Etapa ${current + 1} de ${etapas.length}`}
              {current >= 0 && updated && " · "}
              {updated && `atualizada ${updated}`}
            </p>
          </div>
          <span className="grid size-9 shrink-0 place-items-center rounded-full border border-border text-primary transition-colors group-hover:border-primary group-hover:bg-primary group-hover:text-white">
            <ArrowRight className="size-4" aria-hidden />
          </span>
        </div>
      </Link>
    </li>
  )
}

// ─── Card de candidatura ─────────────────────────────────────────────────────

function ApplicationCard({ candidatura }: { candidatura: Candidatura }) {
  const company = candidatura.nomeEmpresa ?? "Empresa confidencial"
  const { etapas, current } = getProgress(candidatura)
  const isOpen = candidatura.status === "EM_ANDAMENTO"
  const stage = etapaLabel(candidatura.etapaAtual, candidatura.etapasVaga)
  const updated = formatRelativeDate(candidatura.updatedAt)

  return (
    <li className="min-w-0">
      <Link
        href={ROUTES.candidate.application(candidatura.id)}
        className="group relative block overflow-hidden rounded-[28px] border border-border/60 bg-card p-5 transition-colors duration-200 hover:border-primary/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:p-6"
      >
        <div className="flex items-start gap-3 sm:gap-4">
          <CompanyLogo name={company} url={candidatura.logoUrlEmpresa} size="lg" />
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold leading-snug tracking-tight text-foreground transition-colors [overflow-wrap:anywhere] sm:text-lg">
              {candidatura.vagaTitulo}
            </h3>
            <p className="mt-0.5 truncate text-sm text-muted-foreground">{company}</p>
            <div className="mt-2 sm:hidden">
              <StatusBadge status={candidatura.status} size="sm" />
            </div>
          </div>
          <div className="hidden shrink-0 sm:block">
            <StatusBadge status={candidatura.status} size="sm" />
          </div>
        </div>

        {etapas.length > 0 && (
          <div className="mt-5">
            <div className="mb-2.5 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 text-xs">
              <span className="font-semibold text-foreground">{stage}</span>
              {current >= 0 && (
                <span className="tabular-nums text-muted-foreground">
                  Etapa {current + 1} de {etapas.length}
                </span>
              )}
            </div>

            {/* Mobile: barra segmentada compacta */}
            <ol className="flex gap-1 md:hidden" aria-hidden>
              {etapas.map((etapa, index) => (
                <li
                  key={etapa}
                  className={cn(
                    "h-1.5 flex-1 rounded-full",
                    index <= current ? PROGRESS_TONE[candidatura.status] : "bg-border",
                  )}
                />
              ))}
            </ol>

            {/* Desktop: stepper com nome de cada etapa */}
            <ol
              className="hidden gap-1 md:grid"
              style={{ gridTemplateColumns: `repeat(${etapas.length}, minmax(0, 1fr))` }}
              aria-label={`Etapa ${current + 1} de ${etapas.length}: ${stage}`}
            >
              {etapas.map((etapa, index) => {
                const reached = index <= current
                const isCurrent = index === current
                return (
                  <li key={etapa} className="min-w-0">
                    <span
                      className={cn(
                        "block h-1.5 rounded-full",
                        reached ? PROGRESS_TONE[candidatura.status] : "bg-border",
                        isOpen && isCurrent && "motion-safe:animate-pulse",
                      )}
                    />
                    <span
                      className={cn(
                        "mt-1.5 block truncate text-[11px] leading-tight",
                        isCurrent ? "font-semibold text-foreground" : reached ? "text-muted-foreground" : "text-subtle-foreground",
                      )}
                      title={etapaLabel(etapa, candidatura.etapasVaga)}
                    >
                      {etapaLabel(etapa, candidatura.etapasVaga)}
                    </span>
                  </li>
                )
              })}
            </ol>
          </div>
        )}

        <div className="mt-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-xs text-muted-foreground">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            {candidatura.createdAt && (
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="size-3.5" aria-hidden />
                Enviada em <time>{formatDate(candidatura.createdAt)}</time>
              </span>
            )}
            {updated && <span className="hidden sm:inline">Atualizada {updated}</span>}
            <FeedbackCount total={candidatura.totalFeedbacks ?? 0} />
          </div>
          <span className="inline-flex items-center gap-2.5 text-sm font-medium text-primary">
            Ver processo
            <span className="grid size-9 place-items-center rounded-full border border-border transition-colors group-hover:border-primary group-hover:bg-primary group-hover:text-white">
              <ArrowRight className="size-4" aria-hidden />
            </span>
          </span>
        </div>
      </Link>
    </li>
  )
}

function ListSkeleton() {
  return (
    <div className="grid gap-4" aria-hidden>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-44 animate-pulse rounded-3xl bg-border/60" />
      ))}
    </div>
  )
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export function ApplicationsScreen() {
  const { candidaturas, loading, error, refetch } = useMinhasCandidaturas()
  const [filtro, setFiltro] = useState<FiltroId>("TODAS")
  const [busca, setBusca] = useState("")
  const [ordem, setOrdem] = useState<Ordem>("recentes")

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

  const resultados = useMemo(() => {
    const term = busca.trim().toLowerCase()
    const filtradas = candidaturas.filter((item) => {
      if (filtro !== "TODAS" && item.status !== filtro) return false
      if (!term) return true
      return (
        item.vagaTitulo.toLowerCase().includes(term) ||
        (item.nomeEmpresa ?? "").toLowerCase().includes(term)
      )
    })
    return filtradas.sort((a, b) => {
      if (ordem === "antigas") return timestamp(a.createdAt) - timestamp(b.createdAt)
      if (ordem === "atualizadas")
        return timestamp(b.updatedAt ?? b.createdAt) - timestamp(a.updatedAt ?? a.createdAt)
      return timestamp(b.createdAt) - timestamp(a.createdAt)
    })
  }, [candidaturas, filtro, busca, ordem])

  const emFoco = useMemo(
    () =>
      candidaturas
        .filter((item) => item.status === "EM_ANDAMENTO")
        .sort((a, b) => timestamp(b.updatedAt ?? b.createdAt) - timestamp(a.updatedAt ?? a.createdAt))
        .slice(0, 3),
    [candidaturas],
  )

  const hasActiveFilters = filtro !== "TODAS" || busca.trim() !== ""
  const clearAll = () => {
    setFiltro("TODAS")
    setBusca("")
  }

  return (
    <PageShell className="max-w-[1080px]">
      <PageHeader
        eyebrow="Sua jornada"
        title="Candidaturas"
        description="Acompanhe cada etapa dos processos seletivos em que você está participando."
        actions={
          <Link href={ROUTES.candidate.jobs} className="btn-primary rounded-full px-5">
            <Search className="size-4" aria-hidden />
            Buscar novas vagas
          </Link>
        }
      />

      <div className="mt-6 flex flex-col gap-8 sm:mt-8 sm:gap-10">
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
            {loading ? (
              <div className="grid gap-4" aria-hidden>
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-24 animate-pulse rounded-3xl bg-border/60 sm:h-36" />
                  ))}
                </div>
                <div className="grid gap-4 lg:grid-cols-[1.15fr_1fr]">
                  <div className="h-64 animate-pulse rounded-3xl bg-border/60" />
                  <div className="h-64 animate-pulse rounded-3xl bg-border/60" />
                </div>
              </div>
            ) : (
              <ApplicationsInsights
                candidaturas={candidaturas}
                counts={contagem}
                activeFilter={filtro}
                onSelect={(status) => setFiltro(status)}
              />
            )}

            {!loading && emFoco.length > 0 && (
              <Section
                title="Em foco"
                description="Seus processos ativos, do movimento mais recente ao mais antigo."
              >
                <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
                  {emFoco.map((candidatura) => (
                    <FocusCard key={candidatura.id} candidatura={candidatura} />
                  ))}
                </ul>
              </Section>
            )}

            <Section title="Todos os processos">
              {/* Barra de ferramentas: busca + ordenação */}
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative min-w-0 flex-1">
                  <label htmlFor="busca-candidaturas" className="sr-only">
                    Buscar por cargo ou empresa
                  </label>
                  <Search
                    className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden
                  />
                  <input
                    id="busca-candidaturas"
                    type="search"
                    value={busca}
                    onChange={(event) => setBusca(event.target.value)}
                    placeholder="Buscar por cargo ou empresa"
                    autoComplete="off"
                    className="h-11 w-full rounded-full border border-border bg-card pl-11 pr-10 text-sm text-foreground outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground hover:border-border-strong focus:border-primary/50 focus:ring-4 focus:ring-primary/10 [&::-webkit-search-cancel-button]:hidden"
                  />
                  {busca && (
                    <button
                      type="button"
                      onClick={() => setBusca("")}
                      aria-label="Limpar busca"
                      className="absolute right-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <X className="size-4" aria-hidden />
                    </button>
                  )}
                </div>
                <Select
                  aria-label="Ordenar candidaturas"
                  variant="pill"
                  className="sm:w-52"
                  value={ordem}
                  onValueChange={(value) => setOrdem(value as Ordem)}
                  options={[
                    { value: "recentes", label: "Mais recentes" },
                    { value: "atualizadas", label: "Atualizadas recentemente" },
                    { value: "antigas", label: "Mais antigas" },
                  ]}
                />
              </div>

              {/* Filtros */}
              <div className="-mx-4 px-4 sm:mx-0 sm:px-0">
                <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
                  {FILTROS.map((item) => {
                    const active = filtro === item.id
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setFiltro(item.id)}
                        aria-pressed={active}
                        className={cn(
                          "inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors duration-150",
                          active
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:bg-primary-subtle hover:text-primary",
                        )}
                      >
                        {item.label}
                        <span
                          className={cn(
                            "rounded-full px-1.5 py-0.5 text-[11px] font-bold tabular-nums",
                            active ? "bg-white/20 text-primary-foreground" : "bg-muted text-muted-foreground",
                          )}
                        >
                          {contagem[item.id]}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {!loading && candidaturas.length > 0 && (
                <p aria-live="polite" className="text-sm text-muted-foreground">
                  {resultados.length} {resultados.length === 1 ? "processo encontrado" : "processos encontrados"}
                  {hasActiveFilters && (
                    <>
                      {" · "}
                      <button type="button" onClick={clearAll} className="font-semibold text-primary hover:underline">
                        Limpar filtros
                      </button>
                    </>
                  )}
                </p>
              )}

              {loading ? (
                <ListSkeleton />
              ) : resultados.length > 0 ? (
                <ul className="grid gap-4">
                  {resultados.map((candidatura) => (
                    <ApplicationCard key={candidatura.id} candidatura={candidatura} />
                  ))}
                </ul>
              ) : candidaturas.length > 0 ? (
                <EmptyState
                  icon={SearchX}
                  title="Nenhum processo encontrado"
                  description="Ajuste a busca ou troque o filtro para ver os outros processos."
                  action={
                    <button type="button" onClick={clearAll} className="btn-primary">
                      Limpar filtros
                    </button>
                  }
                />
              ) : (
                <EmptyState
                  icon={Sparkles}
                  title="Sua jornada começa aqui"
                  description="Explore as vagas disponíveis e candidate-se à sua primeira oportunidade."
                  action={
                    <Link href={ROUTES.candidate.jobs} className="btn-primary rounded-full px-5">
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
