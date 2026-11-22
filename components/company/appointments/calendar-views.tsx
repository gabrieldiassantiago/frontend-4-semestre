"use client"

import { useEffect, useMemo, useRef } from "react"
import type { AgendamentoEmpresa } from "@/lib/types/candidatura.types"
import { cn } from "@/lib/utils"
import {
  EVENT_STYLE,
  TIME_LABEL,
  WEEKDAY_SHORT,
  endMs,
  layoutDay,
  minutesOfDay,
  sameDay,
  startMs,
} from "./appointment-utils"

const HOUR_PX = 64
const GUTTER = "4rem"
const DEFAULT_FIRST_HOUR = 7
const DEFAULT_LAST_HOUR = 19

function eventsOnDay(events: AgendamentoEmpresa[], day: Date) {
  return events.filter((item) => sameDay(new Date(item.inicio), day))
}

// ─── Grade por horário (dia e semana) ────────────────────────────────────────

export function TimeGrid({
  days,
  events,
  today,
  now,
  onSelect,
}: {
  days: Date[]
  events: AgendamentoEmpresa[]
  today: Date
  now: number
  onSelect: (item: AgendamentoEmpresa) => void
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const single = days.length === 1

  const perDay = useMemo(
    () => days.map((day) => ({ day, laid: layoutDay(eventsOnDay(events, day)) })),
    [days, events],
  )

  // A grade cobre o expediente e se amplia para caber qualquer reunião fora dele.
  const { firstHour, lastHour } = useMemo(() => {
    let first = DEFAULT_FIRST_HOUR
    let last = DEFAULT_LAST_HOUR
    perDay.forEach(({ laid }) =>
      laid.forEach(({ item }) => {
        first = Math.min(first, Math.floor(minutesOfDay(new Date(item.inicio)) / 60))
        last = Math.max(last, Math.min(23, Math.ceil(minutesOfDay(new Date(endMs(item))) / 60)))
      }),
    )
    return { firstHour: first, lastHour: last }
  }, [perDay])

  const hours = Array.from({ length: lastHour - firstHour + 1 }, (_, i) => firstHour + i)
  const height = hours.length * HOUR_PX
  const columns = `${GUTTER} repeat(${days.length}, minmax(0, 1fr))`

  // Ao abrir (ou trocar de período), rola até a primeira reunião ou até o horário atual.
  const rangeKey = days[0].toDateString() + days.length
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const starts = perDay.flatMap(({ laid }) => laid.map(({ item }) => minutesOfDay(new Date(item.inicio))))
    const focus = starts.length ? Math.min(...starts) : minutesOfDay(new Date(now))
    el.scrollTop = Math.max(0, ((focus - firstHour * 60) / 60 - 0.75) * HOUR_PX)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rangeKey, firstHour])

  const nowMinutes = minutesOfDay(new Date(now))
  const nowTop = ((nowMinutes - firstHour * 60) / 60) * HOUR_PX
  const showNow = nowTop >= 0 && nowTop <= height

  return (
    <div ref={scrollRef} className="max-h-[min(72dvh,760px)] overflow-auto rounded-2xl border border-border bg-card shadow-xs">
      <div className={cn(!single && "min-w-[760px]")}>
        {/* Cabeçalho dos dias */}
        <div className="sticky top-0 z-20 grid border-b border-border bg-card/95 backdrop-blur" style={{ gridTemplateColumns: columns }}>
          <div />
          {days.map((day) => {
            const isToday = sameDay(day, today)
            return (
              <div key={day.toISOString()} className="flex items-center justify-center gap-2 border-l border-border-subtle px-2 py-3">
                <span className={cn("text-xs font-medium uppercase tracking-wide", isToday ? "text-primary" : "text-muted-foreground")}>
                  {WEEKDAY_SHORT.format(day).replace(".", "")}
                </span>
                <span
                  className={cn(
                    "grid size-8 place-items-center rounded-full text-sm font-semibold tabular-nums",
                    isToday ? "bg-primary text-primary-foreground" : "text-ink",
                  )}
                >
                  {day.getDate()}
                </span>
              </div>
            )
          })}
        </div>

        {/* Corpo: horas + colunas */}
        <div className="relative grid" style={{ gridTemplateColumns: columns, height }}>
          <div className="relative" aria-hidden>
            {hours.map((hour, index) =>
              index === 0 ? null : (
                <span
                  key={hour}
                  className="absolute right-3 -translate-y-1/2 text-[11px] tabular-nums text-muted-foreground"
                  style={{ top: index * HOUR_PX }}
                >
                  {String(hour).padStart(2, "0")}:00
                </span>
              ),
            )}
          </div>

          {perDay.map(({ day, laid }) => {
            const isToday = sameDay(day, today)
            return (
              <div
                key={day.toISOString()}
                className={cn("relative border-l border-border-subtle", isToday && "bg-primary-subtle/30")}
                style={{
                  backgroundImage: "linear-gradient(to bottom, var(--border-subtle) 1px, transparent 1px)",
                  backgroundSize: `100% ${HOUR_PX}px`,
                }}
              >
                {isToday && showNow && (
                  <div aria-hidden className="pointer-events-none absolute inset-x-0 z-10 flex items-center" style={{ top: nowTop }}>
                    <span className="-ml-1 size-2 rounded-full bg-primary" />
                    <span className="h-px flex-1 bg-primary" />
                  </div>
                )}

                {laid.map(({ item, col, cols }) => {
                  const start = new Date(item.inicio)
                  const top = ((minutesOfDay(start) - firstHour * 60) / 60) * HOUR_PX
                  const blockHeight = Math.max((item.duracaoMinutos / 60) * HOUR_PX, 28)
                  const style = EVENT_STYLE[item.status]
                  const roomy = blockHeight >= 72
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onSelect(item)}
                      aria-label={`${item.candidatoNome}, ${TIME_LABEL.format(start)}, ${item.titulo}`}
                      className={cn(
                        "absolute overflow-hidden rounded-lg border-l-[3px] px-2 py-1 text-left shadow-xs transition-shadow hover:z-10 hover:shadow-md focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary",
                        style.block,
                        style.bar,
                      )}
                      style={{
                        top: top + 1,
                        height: blockHeight - 2,
                        left: `calc(${(col / cols) * 100}% + 3px)`,
                        width: `calc(${100 / cols}% - 6px)`,
                      }}
                    >
                      <span className={cn("block truncate text-[11px] font-medium tabular-nums leading-tight", style.sub)}>
                        {TIME_LABEL.format(start)} – {TIME_LABEL.format(new Date(endMs(item)))}
                      </span>
                      <span className="block truncate text-xs font-semibold leading-snug">{item.candidatoNome}</span>
                      {roomy && <span className={cn("block truncate text-[11px] leading-snug", style.sub)}>{item.titulo}</span>}
                    </button>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Grade mensal ────────────────────────────────────────────────────────────

const WEEKDAY_HEADERS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"]
const MONTH_CHIP_LIMIT = 3

export function MonthGrid({
  days,
  month,
  events,
  today,
  onSelect,
  onOpenDay,
}: {
  days: Date[]
  month: number
  events: AgendamentoEmpresa[]
  today: Date
  onSelect: (item: AgendamentoEmpresa) => void
  onOpenDay: (day: Date) => void
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-xs">
      <div className="min-w-[640px]">
        <div className="grid grid-cols-7 border-b border-border">
          {WEEKDAY_HEADERS.map((label) => (
            <div key={label} className="px-3 py-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {label}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((day) => {
            const inMonth = day.getMonth() === month
            const isToday = sameDay(day, today)
            const items = eventsOnDay(events, day).sort((a, b) => startMs(a) - startMs(b))
            const extra = items.length - MONTH_CHIP_LIMIT
            return (
              <div
                key={day.toISOString()}
                className={cn("min-h-28 border-b border-l border-border-subtle p-1.5 first:border-l-0 [&:nth-child(7n+1)]:border-l-0", !inMonth && "bg-surface/60")}
              >
                <button
                  type="button"
                  onClick={() => onOpenDay(day)}
                  aria-label={`Ver o dia ${day.getDate()}`}
                  className={cn(
                    "mb-1 grid size-7 place-items-center rounded-full text-xs font-semibold tabular-nums transition-colors hover:bg-muted",
                    isToday ? "bg-primary text-primary-foreground hover:bg-primary-hover" : inMonth ? "text-ink" : "text-subtle-foreground",
                  )}
                >
                  {day.getDate()}
                </button>
                <ul className="space-y-1">
                  {items.slice(0, MONTH_CHIP_LIMIT).map((item) => {
                    const style = EVENT_STYLE[item.status]
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={() => onSelect(item)}
                          className={cn(
                            "flex w-full items-center gap-1.5 truncate rounded-md border-l-2 px-1.5 py-0.5 text-left text-[11px] font-medium hover:brightness-95",
                            style.block,
                            style.bar,
                          )}
                        >
                          <span className="tabular-nums opacity-70">{TIME_LABEL.format(new Date(item.inicio))}</span>
                          <span className="truncate">{item.candidatoNome}</span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
                {extra > 0 && (
                  <button
                    type="button"
                    onClick={() => onOpenDay(day)}
                    className="mt-1 px-1.5 text-[11px] font-semibold text-primary hover:underline"
                  >
                    +{extra} mais
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
