import type { AgendamentoEmpresa, StatusAgendamento } from "@/lib/types/candidatura.types"

export type View = "dia" | "semana" | "mes" | "lista"
export type StatusTab = "todos" | "PENDENTE" | "CONFIRMADO" | "REALIZADO" | "encerrados"

export const MINUTE = 60_000
export const DAY = 86_400_000

export const DAY_LABEL = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "numeric", month: "long" })
export const TIME_LABEL = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" })
export const WEEKDAY_SHORT = new Intl.DateTimeFormat("pt-BR", { weekday: "short" })
export const MONTH_YEAR = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" })
export const DAY_MONTH_SHORT = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" })
export const FULL_DATE = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })

/**
 * Situação do agendamento em paleta Selecta: roxo = aguardando, menta = confirmado,
 * grafite = realizado, cinza = encerrado. Vermelho só aparece onde algo deu errado.
 */
export const STATUS_META: Record<StatusAgendamento, { label: string; text: string; dot: string }> = {
  PENDENTE: { label: "Aguardando candidato", text: "text-primary", dot: "bg-primary" },
  CONFIRMADO: { label: "Confirmado", text: "text-mint-strong", dot: "bg-mint" },
  REALIZADO: { label: "Realizado", text: "text-ink", dot: "bg-ink" },
  CANCELADO: { label: "Cancelado", text: "text-muted-foreground", dot: "bg-border-strong" },
  RECUSADO: { label: "Recusado pelo candidato", text: "text-danger-foreground", dot: "bg-danger" },
  NAO_COMPARECEU: { label: "Não compareceu", text: "text-danger-foreground", dot: "bg-danger" },
}

/** Bloco no calendário: fundo suave + barra lateral na cor da situação. */
export const EVENT_STYLE: Record<StatusAgendamento, { block: string; bar: string; sub: string }> = {
  PENDENTE: { block: "bg-primary-subtle text-primary-deep", bar: "border-primary", sub: "text-primary-deep/70" },
  CONFIRMADO: { block: "bg-mint-subtle text-mint-strong", bar: "border-mint", sub: "text-mint-strong/75" },
  REALIZADO: { block: "bg-muted text-ink", bar: "border-ink", sub: "text-muted-foreground" },
  CANCELADO: { block: "bg-surface text-muted-foreground line-through decoration-border-strong", bar: "border-border-strong", sub: "text-subtle-foreground" },
  RECUSADO: { block: "bg-danger-subtle text-danger-foreground", bar: "border-danger", sub: "text-danger-foreground/75" },
  NAO_COMPARECEU: { block: "bg-danger-subtle text-danger-foreground", bar: "border-danger", sub: "text-danger-foreground/75" },
}

export const STATUS_TABS: { id: StatusTab; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "PENDENTE", label: "Pendentes" },
  { id: "CONFIRMADO", label: "Confirmados" },
  { id: "REALIZADO", label: "Realizados" },
  { id: "encerrados", label: "Encerrados" },
]

export function matchesStatusTab(item: AgendamentoEmpresa, tab: StatusTab) {
  if (tab === "todos") return true
  if (tab === "encerrados") return item.status === "CANCELADO" || item.status === "RECUSADO" || item.status === "NAO_COMPARECEU"
  return item.status === tab
}

// ─── Datas ───────────────────────────────────────────────────────────────────

export function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export function addDays(date: Date, days: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days)
}

/** Semana começando na segunda-feira. */
export function startOfWeek(date: Date) {
  const day = startOfDay(date)
  return addDays(day, -((day.getDay() + 6) % 7))
}

export function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

export function startMs(item: AgendamentoEmpresa) {
  return new Date(item.inicio).getTime()
}

export function endMs(item: AgendamentoEmpresa) {
  return startMs(item) + item.duracaoMinutos * MINUTE
}

/** Pendente ou confirmado: ainda é uma reunião "viva", que pode acontecer. */
export function isLive(item: AgendamentoEmpresa) {
  return item.status === "PENDENTE" || item.status === "CONFIRMADO"
}

export function isHappening(item: AgendamentoEmpresa, now: number) {
  return isLive(item) && startMs(item) <= now && endMs(item) >= now
}

export function minutesOfDay(date: Date) {
  return date.getHours() * 60 + date.getMinutes()
}

/** Dias exibidos para cada modo de visualização, em torno da data de referência. */
export function daysFor(view: View, anchor: Date): Date[] {
  if (view === "dia") return [startOfDay(anchor)]
  if (view === "mes") {
    const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1)
    const gridStart = startOfWeek(first)
    return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i))
  }
  const weekStart = startOfWeek(anchor)
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
}

export function shiftAnchor(view: View, anchor: Date, direction: 1 | -1) {
  if (view === "dia") return addDays(anchor, direction)
  if (view === "mes") return new Date(anchor.getFullYear(), anchor.getMonth() + direction, 1)
  return addDays(anchor, 7 * direction)
}

export function rangeLabel(view: View, anchor: Date) {
  if (view === "mes") return null
  const days = daysFor(view, anchor)
  const first = days[0]
  const last = days[days.length - 1]
  const fmt = (d: Date) => DAY_MONTH_SHORT.format(d).replace(".", "")
  if (view === "dia") return `${fmt(first)} ${first.getFullYear()}`
  return `${fmt(first)} – ${fmt(last)} ${last.getFullYear()}`
}

export function dayHeading(date: Date, today: Date) {
  const diff = Math.round((startOfDay(date).getTime() - today.getTime()) / DAY)
  const text = DAY_LABEL.format(date)
  if (diff === 0) return { lead: "Hoje", text }
  if (diff === 1) return { lead: "Amanhã", text }
  if (diff === -1) return { lead: "Ontem", text }
  return { lead: null, text }
}

export function relativeStart(item: AgendamentoEmpresa, now: number) {
  const diff = startMs(item) - now
  if (diff <= 0) return endMs(item) >= now ? "Acontecendo agora" : null
  const minutes = Math.round(diff / MINUTE)
  if (minutes < 1) return "Começa agora"
  if (minutes < 60) return `Em ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `Em ${hours} h`
  const days = Math.floor(hours / 24)
  return `Em ${days} ${days === 1 ? "dia" : "dias"}`
}

/** O link vem de texto digitado pela empresa: só abrimos http(s). */
export function safeHref(link: string) {
  try {
    const url = new URL(link)
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null
  } catch {
    return null
  }
}

// ─── Layout dos blocos de um dia ─────────────────────────────────────────────

const MIN_VISUAL_MINUTES = 30

/**
 * Distribui reuniões que se sobrepõem em colunas lado a lado.
 * Cada resultado diz em qual coluna fica e quantas colunas o grupo ocupa.
 */
export function layoutDay(items: AgendamentoEmpresa[]) {
  const sorted = [...items].sort((a, b) => startMs(a) - startMs(b) || endMs(b) - endMs(a))
  const result: { item: AgendamentoEmpresa; col: number; cols: number }[] = []

  let cluster: { item: AgendamentoEmpresa; col: number }[] = []
  let columnEnds: number[] = []
  let clusterEnd = -Infinity

  const flush = () => {
    const cols = columnEnds.length
    cluster.forEach((entry) => result.push({ item: entry.item, col: entry.col, cols }))
    cluster = []
    columnEnds = []
    clusterEnd = -Infinity
  }

  for (const item of sorted) {
    const start = startMs(item)
    const end = Math.max(endMs(item), start + MIN_VISUAL_MINUTES * MINUTE)
    if (cluster.length && start >= clusterEnd) flush()

    let col = columnEnds.findIndex((columnEnd) => columnEnd <= start)
    if (col === -1) {
      col = columnEnds.length
      columnEnds.push(end)
    } else {
      columnEnds[col] = end
    }
    cluster.push({ item, col })
    clusterEnd = Math.max(clusterEnd, end)
  }
  flush()

  return result
}
