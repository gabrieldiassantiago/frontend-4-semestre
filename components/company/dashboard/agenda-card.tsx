"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { CalendarClock, ChevronLeft, ChevronRight, Video } from "lucide-react"
import { ROUTES } from "@/lib/config/routes"
import { useAgendamentosEmpresa } from "@/lib/queries/use-candidaturas"
import type { AgendamentoEmpresa } from "@/lib/types/candidatura.types"
import { cn } from "@/lib/utils"

const MONTH_LABEL = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" })
const DAY_LABEL = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "numeric", month: "long" })
const TIME_LABEL = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" })
const WEEKDAYS = ["S", "T", "Q", "Q", "S", "S", "D"] // semana começa na segunda
const MINUTE = 60_000
const PREVIEW_LIMIT = 3

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function isLive(item: AgendamentoEmpresa) {
  return item.status === "PENDENTE" || item.status === "CONFIRMADO"
}

/** Calendário do mês com as reuniões marcadas e um resumo das próximas. */
export function AgendaCard() {
  const { agendamentos, loading } = useAgendamentosEmpresa()
  const [month, setMonth] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })
  const [selected, setSelected] = useState<Date | null>(null)
  const today = new Date()

  const live = useMemo(() => agendamentos.filter(isLive), [agendamentos])

  const perDay = useMemo(() => {
    const map = new Map<string, number>()
    live.forEach((item) => {
      const key = new Date(item.inicio).toDateString()
      map.set(key, (map.get(key) ?? 0) + 1)
    })
    return map
  }, [live])

  // 6 semanas completas, começando na segunda-feira da primeira semana do mês
  const cells = useMemo(() => {
    const offset = (month.getDay() + 6) % 7
    return Array.from({ length: 42 }, (_, i) => new Date(month.getFullYear(), month.getMonth(), 1 - offset + i))
  }, [month])

  const items = useMemo(() => {
    const now = Date.now()
    const base = selected
      ? live.filter((item) => sameDay(new Date(item.inicio), selected))
      : live.filter((item) => new Date(item.inicio).getTime() + item.duracaoMinutos * MINUTE >= now)
    return base.sort((a, b) => a.inicio.localeCompare(b.inicio)).slice(0, PREVIEW_LIMIT)
  }, [live, selected])

  const shift = (delta: number) => setMonth((current) => new Date(current.getFullYear(), current.getMonth() + delta, 1))

  return (
    <section aria-label="Agenda de reuniões" className="rounded-2xl border border-border bg-card p-4 shadow-xs sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary-subtle text-primary">
            <CalendarClock aria-hidden className="size-[18px]" />
          </span>
          <h2 className="truncate text-sm font-semibold capitalize text-foreground">{MONTH_LABEL.format(month)}</h2>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => shift(-1)}
            aria-label="Mês anterior"
            className="grid size-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ChevronLeft aria-hidden className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => shift(1)}
            aria-label="Próximo mês"
            className="grid size-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ChevronRight aria-hidden className="size-4" />
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-y-1 text-center">
        {WEEKDAYS.map((label, index) => (
          <span key={index} aria-hidden className="pb-1 text-[11px] font-medium text-muted-foreground">
            {label}
          </span>
        ))}
        {cells.map((day) => {
          const inMonth = day.getMonth() === month.getMonth()
          const count = perDay.get(day.toDateString()) ?? 0
          const isToday = sameDay(day, today)
          const active = selected !== null && sameDay(selected, day)
          return (
            <button
              key={day.toISOString()}
              type="button"
              aria-pressed={active}
              aria-label={`${DAY_LABEL.format(day)}${count ? `: ${count} ${count === 1 ? "reunião" : "reuniões"}` : ""}`}
              onClick={() => setSelected(active ? null : day)}
              className={cn(
                "relative mx-auto grid size-9 place-items-center rounded-full text-sm tabular-nums transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary",
                active
                  ? "bg-primary font-semibold text-primary-foreground shadow-sm shadow-primary/30"
                  : isToday
                    ? "bg-primary-subtle font-semibold text-primary hover:bg-primary-subtle/70"
                    : inMonth
                      ? "text-foreground hover:bg-muted"
                      : "text-subtle-foreground hover:bg-muted",
              )}
            >
              {day.getDate()}
              {count > 0 && (
                <span
                  aria-hidden
                  className={cn("absolute bottom-0.5 size-1 rounded-full", active ? "bg-mint" : "bg-mint-strong")}
                />
              )}
            </button>
          )
        })}
      </div>

      <div className="mt-4 border-t border-border-subtle pt-4">
        <p className="mb-2.5 text-xs font-semibold text-muted-foreground">
          {selected ? <span className="capitalize">{DAY_LABEL.format(selected)}</span> : "Próximas reuniões"}
        </p>

        {loading ? (
          <div aria-hidden className="space-y-2">
            <div className="h-11 animate-pulse rounded-xl bg-border/60" />
            <div className="h-11 animate-pulse rounded-xl bg-border/60" />
          </div>
        ) : items.length > 0 ? (
          <ul className="space-y-2">
            {items.map((item) => (
              <li key={item.id}>
                <Link
                  href={ROUTES.company.appointments}
                  className="group flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-muted"
                >
                  <span className="grid w-14 shrink-0 place-items-center rounded-lg bg-primary-subtle py-1.5 text-center">
                    <span className="text-sm font-bold tabular-nums leading-none text-primary">{TIME_LABEL.format(new Date(item.inicio))}</span>
                    {!selected && (
                      <span className="mt-0.5 text-[10px] font-medium capitalize leading-none text-primary/70">
                        {new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(new Date(item.inicio)).replace(".", "")}
                      </span>
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-foreground group-hover:text-primary">{item.candidatoNome}</span>
                    <span className="block truncate text-xs text-muted-foreground">{item.titulo}</span>
                  </span>
                  <Video aria-hidden className="size-4 shrink-0 text-muted-foreground" />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-xl bg-surface px-3 py-3 text-sm text-muted-foreground">
            {selected ? "Nenhuma reunião neste dia." : "Nenhuma reunião marcada por enquanto."}
          </p>
        )}

        <Link
          href={ROUTES.company.appointments}
          className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
        >
          Ver todos os agendamentos
          <ChevronRight aria-hidden className="size-3.5" />
        </Link>
      </div>
    </section>
  )
}
