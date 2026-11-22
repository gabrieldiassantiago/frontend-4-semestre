"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { CalendarClock, ChevronLeft, ChevronRight, Plus, RefreshCw, Search, SearchX, Video, X } from "lucide-react"

import { PageShell } from "@/components/ui/page"
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/states"
import { ROUTES } from "@/lib/config/routes"
import { useAgendamentosEmpresa } from "@/lib/queries/use-candidaturas"
import type { AgendamentoEmpresa } from "@/lib/types/candidatura.types"
import { cn } from "@/lib/utils"
import { AppointmentCard } from "./appointment-card"
import { AppointmentDetailModal } from "./appointment-detail-modal"
import { MonthGrid, TimeGrid } from "./calendar-views"
import {
  DAY,
  MINUTE,
  MONTH_YEAR,
  STATUS_TABS,
  dayHeading,
  daysFor,
  endMs,
  isLive,
  matchesStatusTab,
  rangeLabel,
  relativeStart,
  safeHref,
  sameDay,
  shiftAnchor,
  startMs,
  startOfDay,
  type StatusTab,
  type View,
} from "./appointment-utils"

const VIEWS: { id: View; label: string }[] = [
  { id: "dia", label: "Dia" },
  { id: "semana", label: "Semana" },
  { id: "mes", label: "Mês" },
  { id: "lista", label: "Lista" },
]

export function CompanyAppointmentsScreen() {
  const [onlyMine, setOnlyMine] = useState(false)
  const { agendamentos, loading, refreshing, error, refetch } = useAgendamentosEmpresa(
    onlyMine ? { criadoPorMim: true } : undefined,
  )

  const [view, setView] = useState<View>("semana")
  const [anchor, setAnchor] = useState(() => startOfDay(new Date()))
  const [statusTab, setStatusTab] = useState<StatusTab>("todos")
  const [busca, setBusca] = useState("")
  const [selected, setSelected] = useState<{ id: string; cancel: boolean } | null>(null)

  // Em telas estreitas a grade semanal não cabe: abre direto na lista.
  useEffect(() => {
    if (window.matchMedia("(max-width: 767px)").matches) setView("lista")
  }, [])

  // Mantém "Em 12 min" e a linha do horário atual em dia sem recarregar a tela.
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), MINUTE)
    return () => window.clearInterval(timer)
  }, [])

  const today = useMemo(() => startOfDay(new Date(now)), [now])

  const tabCounts = useMemo(() => {
    const counts = {} as Record<StatusTab, number>
    STATUS_TABS.forEach(({ id }) => {
      counts[id] = agendamentos.filter((item) => matchesStatusTab(item, id)).length
    })
    return counts
  }, [agendamentos])

  const filtered = useMemo(() => {
    const term = busca.trim().toLocaleLowerCase("pt-BR")
    return agendamentos.filter((item) => {
      if (!matchesStatusTab(item, statusTab)) return false
      if (!term) return true
      return [item.candidatoNome, item.vagaTitulo, item.titulo].some((value) => value?.toLocaleLowerCase("pt-BR").includes(term))
    })
  }, [agendamentos, statusTab, busca])

  const days = useMemo(() => daysFor(view, anchor), [view, anchor])

  // Reuniões do período em exibição (usado na lista e para saber se o período está vazio)
  const inRange = useMemo(() => {
    if (view === "mes") return filtered.filter((item) => new Date(item.inicio).getMonth() === anchor.getMonth() && new Date(item.inicio).getFullYear() === anchor.getFullYear())
    return filtered.filter((item) => days.some((day) => sameDay(day, new Date(item.inicio))))
  }, [filtered, view, days, anchor])

  const groups = useMemo(() => {
    const map = new Map<string, { date: Date; items: AgendamentoEmpresa[] }>()
    ;[...inRange]
      .sort((a, b) => startMs(a) - startMs(b))
      .forEach((item) => {
        const date = new Date(item.inicio)
        const key = date.toDateString()
        if (!map.has(key)) map.set(key, { date: startOfDay(date), items: [] })
        map.get(key)!.items.push(item)
      })
    return [...map.values()]
  }, [inRange])

  const upcoming = useMemo(
    () => agendamentos.filter((item) => isLive(item) && endMs(item) >= now).sort((a, b) => startMs(a) - startMs(b)),
    [agendamentos, now],
  )
  const todayCount = upcoming.filter((item) => sameDay(new Date(item.inicio), today)).length
  const weekCount = upcoming.filter((item) => startMs(item) < today.getTime() + 7 * DAY).length

  // Aviso quando uma reunião está acontecendo ou começa na próxima hora
  const soon = upcoming.find((item) => startMs(item) - now <= 60 * MINUTE) ?? null
  const soonHref = soon ? safeHref(soon.link) : null

  const selectedItem = selected ? (agendamentos.find((item) => item.id === selected.id) ?? null) : null
  const hasAny = agendamentos.length > 0
  const hasFilters = Boolean(busca.trim() || statusTab !== "todos" || onlyMine)
  const isCurrent = view === "mes" ? anchor.getMonth() === today.getMonth() && anchor.getFullYear() === today.getFullYear() : days.some((day) => sameDay(day, today))
  const label = rangeLabel(view, anchor)

  function clearFilters() {
    setBusca("")
    setStatusTab("todos")
    setOnlyMine(false)
  }

  function openDay(day: Date) {
    setAnchor(startOfDay(day))
    setView("dia")
  }

  const summary =
    loading || !hasAny
      ? "Reuniões e entrevistas marcadas com candidatos das suas vagas."
      : todayCount > 0
        ? `Você tem ${todayCount} ${todayCount === 1 ? "reunião" : "reuniões"} hoje e ${weekCount} nos próximos 7 dias.`
        : weekCount > 0
          ? `Nenhuma reunião hoje. ${weekCount} ${weekCount === 1 ? "reunião" : "reuniões"} nos próximos 7 dias.`
          : "Nenhuma reunião marcada para os próximos 7 dias."

  return (
    <PageShell className="max-w-[1320px]">
      {/* Cabeçalho */}
      <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Meus agendamentos</h1>
          <p className="mt-2 text-sm text-muted-foreground" aria-live="polite">{summary}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-0 flex-1 sm:w-60 sm:flex-none">
            <label htmlFor="busca-agendamentos" className="sr-only">
              Buscar por candidato ou vaga
            </label>
            <Search aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="busca-agendamentos"
              type="search"
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
              placeholder="Buscar candidato ou vaga"
              autoComplete="off"
              className="h-10 w-full rounded-xl border border-border bg-card pl-10 pr-9 text-sm outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground hover:border-border-strong focus:border-primary/50 focus:ring-4 focus:ring-primary/10 [&::-webkit-search-cancel-button]:hidden"
            />
            {busca && (
              <button
                type="button"
                onClick={() => setBusca("")}
                aria-label="Limpar busca"
                className="absolute right-1.5 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X aria-hidden className="size-4" />
              </button>
            )}
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={onlyMine}
            onClick={() => setOnlyMine((current) => !current)}
            className="inline-flex min-h-10 items-center gap-2.5 rounded-xl border border-border bg-card px-3 text-sm font-medium text-strong-foreground transition-colors hover:border-border-strong"
          >
            <span aria-hidden className={cn("relative h-5 w-9 rounded-full transition-colors", onlyMine ? "bg-primary" : "bg-border-strong")}>
              <span className={cn("absolute top-0.5 size-4 rounded-full bg-white shadow-sm transition-all", onlyMine ? "left-[1.125rem]" : "left-0.5")} />
            </span>
            Só os meus
          </button>

          <button
            type="button"
            onClick={() => void refetch()}
            disabled={refreshing}
            aria-label="Atualizar agendamentos"
            className="grid size-10 place-items-center rounded-xl border border-border bg-card text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
          >
            <RefreshCw aria-hidden className={cn("size-4", refreshing && "animate-spin")} />
          </button>

          <Link
            href={ROUTES.company.processes}
            className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-ink px-4 text-sm font-semibold text-white transition-colors hover:bg-primary"
          >
            <Plus aria-hidden className="size-4" />
            Novo agendamento
          </Link>
        </div>
      </header>

      {error ? (
        <div className="mt-8">
          <ErrorState
            description={error}
            action={
              <button type="button" onClick={() => void refetch()} className="btn-secondary">
                Tentar novamente
              </button>
            }
          />
        </div>
      ) : (
        <>
          {/* Aviso contextual: só aparece quando há reunião agora ou na próxima hora */}
          {soon && (
            <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl bg-ink px-5 py-3.5 text-white">
              <span aria-hidden className="size-2 shrink-0 rounded-full bg-mint motion-safe:animate-pulse" />
              <p className="min-w-0 flex-1 text-sm">
                <span className="font-semibold">{soon.candidatoNome}</span>
                <span className="text-white/70"> · {soon.titulo}</span>
              </p>
              <span className="text-sm font-semibold text-mint">{relativeStart(soon, now)}</span>
              <button
                type="button"
                onClick={() => setSelected({ id: soon.id, cancel: false })}
                className="inline-flex min-h-9 items-center gap-2 rounded-full bg-white/10 px-4 text-sm font-semibold transition-colors hover:bg-white/20"
              >
                Ver detalhes
              </button>
              {soonHref && (
                <a
                  href={soonHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-9 items-center gap-2 rounded-full bg-mint px-4 text-sm font-semibold text-ink transition-colors hover:bg-mint-hover"
                >
                  <Video aria-hidden className="size-4" />
                  Entrar
                </a>
              )}
            </div>
          )}

          {/* Abas de situação */}
          <div
            role="group"
            aria-label="Filtrar por situação"
            className="-mx-4 mt-7 flex gap-6 overflow-x-auto border-b border-border px-4 sm:mx-0 sm:gap-7 sm:px-0"
          >
            {STATUS_TABS.map(({ id, label: tabLabel }) => {
              const active = statusTab === id
              return (
                <button
                  key={id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setStatusTab(id)}
                  className={cn(
                    "-mb-px inline-flex min-h-11 shrink-0 items-center gap-2 border-b-2 text-sm transition-colors",
                    active ? "border-primary font-semibold text-ink" : "border-transparent font-medium text-muted-foreground hover:text-foreground",
                  )}
                >
                  {tabLabel}
                  <span className={cn("text-xs tabular-nums", active ? "text-primary" : "text-subtle-foreground")}>
                    {loading ? "–" : tabCounts[id]}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Barra do calendário: período à esquerda, visualização à direita */}
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 py-5">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="min-w-[10rem] text-xl font-semibold capitalize tracking-tight text-ink">{MONTH_YEAR.format(anchor)}</h2>
              <button
                type="button"
                onClick={() => setAnchor(today)}
                disabled={isCurrent}
                className="min-h-9 rounded-lg border border-border bg-card px-3.5 text-sm font-medium text-strong-foreground transition-colors hover:bg-muted disabled:opacity-50"
              >
                Hoje
              </button>
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => setAnchor((current) => shiftAnchor(view, current, -1))}
                  aria-label="Período anterior"
                  className="grid size-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <ChevronLeft aria-hidden className="size-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setAnchor((current) => shiftAnchor(view, current, 1))}
                  aria-label="Próximo período"
                  className="grid size-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <ChevronRight aria-hidden className="size-5" />
                </button>
              </div>
              {label && <span className="hidden text-sm tabular-nums text-muted-foreground sm:inline">{label}</span>}
            </div>

            <div role="group" aria-label="Modo de visualização" className="inline-flex rounded-xl bg-muted p-1">
              {VIEWS.map(({ id, label: viewLabel }) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={view === id}
                  onClick={() => setView(id)}
                  className={cn(
                    "min-h-8 rounded-lg px-3.5 text-sm font-medium transition-all",
                    view === id ? "bg-card text-ink shadow-sm" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {viewLabel}
                </button>
              ))}
            </div>
          </div>

          {/* Visualização */}
          {loading ? (
            <Skeleton className="h-[560px] rounded-2xl" />
          ) : !hasAny ? (
            <EmptyState
              icon={CalendarClock}
              title="Você ainda não agendou nenhuma reunião"
              description="Abra o processo seletivo de uma vaga, escolha um candidato e agende a entrevista. Ela vai aparecer aqui, no calendário."
              action={
                <Link href={ROUTES.company.processes} className="btn-primary">
                  Ir para os processos
                </Link>
              }
            />
          ) : filtered.length === 0 && hasFilters ? (
            <EmptyState
              icon={SearchX}
              title="Nenhum agendamento encontrado"
              description="Ajuste a busca ou os filtros para ver outros agendamentos."
              action={
                <button type="button" onClick={clearFilters} className="btn-secondary">
                  Limpar filtros
                </button>
              }
            />
          ) : view === "lista" ? (
            groups.length > 0 ? (
              <div className="flex flex-col gap-9" aria-live="polite">
                {groups.map(({ date, items }) => {
                  const heading = dayHeading(date, today)
                  return (
                    <section key={date.toISOString()} aria-label={heading.text}>
                      <h3 className="mb-4 flex flex-wrap items-baseline gap-x-2 text-sm">
                        {heading.lead && <span className="text-base font-semibold text-ink">{heading.lead}</span>}
                        <span className={cn("capitalize", heading.lead ? "text-muted-foreground" : "text-base font-semibold text-ink")}>{heading.text}</span>
                      </h3>
                      <ul className="grid gap-5 sm:gap-4">
                        {items.map((item) => (
                          <AppointmentCard
                            key={item.id}
                            item={item}
                            now={now}
                            onCancel={(target) => setSelected({ id: target.id, cancel: true })}
                          />
                        ))}
                      </ul>
                    </section>
                  )
                })}
              </div>
            ) : (
              <EmptyState
                icon={CalendarClock}
                title="Nada neste período"
                description="Não há reuniões na semana em exibição. Use as setas para navegar ou volte para hoje."
                action={
                  <button type="button" onClick={() => setAnchor(today)} className="btn-secondary">
                    Voltar para hoje
                  </button>
                }
              />
            )
          ) : view === "mes" ? (
            <MonthGrid
              days={days}
              month={anchor.getMonth()}
              events={filtered}
              today={today}
              onSelect={(item) => setSelected({ id: item.id, cancel: false })}
              onOpenDay={openDay}
            />
          ) : (
            <TimeGrid
              days={days}
              events={filtered}
              today={today}
              now={now}
              onSelect={(item) => setSelected({ id: item.id, cancel: false })}
            />
          )}

          {/* Legenda das cores */}
          {!loading && hasAny && view !== "lista" && (
            <ul aria-label="Legenda" className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
              {[
                ["bg-primary", "Aguardando candidato"],
                ["bg-mint", "Confirmado"],
                ["bg-ink", "Realizado"],
                ["bg-border-strong", "Cancelado"],
                ["bg-danger", "Recusado / faltou"],
              ].map(([dot, text]) => (
                <li key={text} className="inline-flex items-center gap-1.5">
                  <span aria-hidden className={cn("size-2 rounded-full", dot)} />
                  {text}
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      <AppointmentDetailModal
        item={selectedItem}
        now={now}
        startInCancel={selected?.cancel ?? false}
        onClose={() => setSelected(null)}
      />
    </PageShell>
  )
}
