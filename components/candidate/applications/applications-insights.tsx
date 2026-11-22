"use client"

import { useMemo, useState } from "react"
import { CheckCircle2, Hourglass, MessageSquareQuote, Send, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  STATUS_LABELS,
  type Candidatura,
  type StatusCandidatura,
} from "@/lib/types/candidatura.types"

const STATUS_ORDER: StatusCandidatura[] = ["EM_ANDAMENTO", "APROVADA", "REPROVADA", "CANCELADA"]

/** Cores semânticas de status (sempre acompanhadas de rótulo e número, nunca só cor). */
const STATUS_STROKE: Record<StatusCandidatura, string> = {
  EM_ANDAMENTO: "stroke-primary",
  APROVADA: "stroke-success",
  REPROVADA: "stroke-danger",
  CANCELADA: "stroke-border-strong",
}

const STATUS_DOT: Record<StatusCandidatura, string> = {
  EM_ANDAMENTO: "bg-primary",
  APROVADA: "bg-success",
  REPROVADA: "bg-danger",
  CANCELADA: "bg-border-strong",
}

const RADIUS = 52
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const GAP = 3 // respiro entre fatias, em unidades do traço

// ─── Rosca: situação das candidaturas ────────────────────────────────────────

function StatusDonut({
  counts,
  total,
  activeFilter,
  onSelect,
}: {
  counts: Record<StatusCandidatura, number>
  total: number
  activeFilter: StatusCandidatura | "TODAS"
  onSelect: (status: StatusCandidatura | "TODAS") => void
}) {
  const [hovered, setHovered] = useState<StatusCandidatura | null>(null)

  const segments = useMemo(() => {
    let offset = 0
    return STATUS_ORDER.filter((status) => counts[status] > 0).map((status) => {
      const fraction = counts[status] / total
      const visible = Math.max(fraction * CIRCUMFERENCE - (total > counts[status] ? GAP : 0), 0.5)
      const segment = { status, length: visible, offset }
      offset += fraction * CIRCUMFERENCE
      return segment
    })
  }, [counts, total])

  const focus = hovered ?? (activeFilter !== "TODAS" ? activeFilter : null)
  const centerValue = focus ? counts[focus] : total
  const centerLabel = focus ? STATUS_LABELS[focus] : total === 1 ? "candidatura" : "candidaturas"

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:gap-8">
      <div className="relative size-36 shrink-0 sm:size-40">
        <svg viewBox="0 0 120 120" className="size-full -rotate-90" role="img" aria-label="Distribuição das candidaturas por situação">
          <circle cx="60" cy="60" r={RADIUS} fill="none" strokeWidth="12" className="stroke-border/60" />
          {segments.map(({ status, length, offset }) => (
            <circle
              key={status}
              cx="60"
              cy="60"
              r={RADIUS}
              fill="none"
              strokeWidth={focus === status ? 15 : 12}
              strokeLinecap="butt"
              strokeDasharray={`${length} ${CIRCUMFERENCE}`}
              strokeDashoffset={-offset}
              className={cn(
                STATUS_STROKE[status],
                "cursor-pointer transition-[stroke-width,opacity] duration-200",
                focus && focus !== status && "opacity-30",
              )}
              onMouseEnter={() => setHovered(status)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onSelect(activeFilter === status ? "TODAS" : status)}
            />
          ))}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-bold tabular-nums leading-none tracking-tight text-foreground">
            {centerValue}
          </span>
          <span className="mt-1 max-w-[6rem] text-xs leading-tight text-muted-foreground">{centerLabel}</span>
        </div>
      </div>

      <ul className="w-full min-w-0 flex-1 space-y-1">
        {STATUS_ORDER.map((status) => {
          const count = counts[status]
          const pct = total ? Math.round((count / total) * 100) : 0
          const active = activeFilter === status
          return (
            <li key={status}>
              <button
                type="button"
                aria-pressed={active}
                onClick={() => onSelect(active ? "TODAS" : status)}
                onMouseEnter={() => setHovered(status)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(status)}
                onBlur={() => setHovered(null)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-full px-3.5 py-2 text-left text-sm transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-primary",
                  active && "bg-primary-subtle",
                )}
              >
                <span className={cn("size-2.5 shrink-0 rounded-full", STATUS_DOT[status])} aria-hidden />
                <span className="flex-1 truncate text-foreground">{STATUS_LABELS[status]}</span>
                <span className="font-semibold tabular-nums text-foreground">{count}</span>
                <span className="w-10 text-right text-xs tabular-nums text-muted-foreground">{pct}%</span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

// ─── Barras: candidaturas enviadas por mês ───────────────────────────────────

const MONTH_FORMAT = new Intl.DateTimeFormat("pt-BR", { month: "short" })
const MONTH_LONG_FORMAT = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" })

function MonthlyBars({ candidaturas }: { candidaturas: Candidatura[] }) {
  const [hovered, setHovered] = useState<number | null>(null)

  const months = useMemo(() => {
    const now = new Date()
    const base = Array.from({ length: 6 }, (_, i) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
      return {
        key: `${date.getFullYear()}-${date.getMonth()}`,
        short: MONTH_FORMAT.format(date).replace(".", ""),
        long: MONTH_LONG_FORMAT.format(date),
        count: 0,
      }
    })
    for (const item of candidaturas) {
      if (!item.createdAt) continue
      const date = new Date(item.createdAt)
      const slot = base.find((m) => m.key === `${date.getFullYear()}-${date.getMonth()}`)
      if (slot) slot.count += 1
    }
    return base
  }, [candidaturas])

  const max = Math.max(...months.map((m) => m.count), 1)
  const sent = months.reduce((sum, m) => sum + m.count, 0)

  return (
    <div>
      <div className="flex items-end justify-between gap-2">
        <div>
          <p className="text-2xl font-bold tabular-nums leading-none tracking-tight text-foreground">{sent}</p>
          <p className="mt-1 text-xs text-muted-foreground">enviadas nos últimos 6 meses</p>
        </div>
        <p aria-live="polite" className="h-4 text-xs font-medium text-strong-foreground">
          {hovered !== null &&
            `${months[hovered].count} ${months[hovered].count === 1 ? "candidatura" : "candidaturas"} em ${months[hovered].long}`}
        </p>
      </div>

      <ul className="mt-5 flex h-36 items-end gap-2 border-b border-border sm:gap-3" aria-label="Candidaturas por mês">
        {months.map((month, index) => {
          const height = month.count === 0 ? 0 : Math.max((month.count / max) * 100, 8)
          return (
            <li
              key={month.key}
              className="group relative flex h-full flex-1 flex-col justify-end"
              onMouseEnter={() => setHovered(index)}
              onMouseLeave={() => setHovered(null)}
            >
              <span
                className={cn(
                  "mb-1 text-center text-xs font-semibold tabular-nums transition-opacity",
                  month.count > 0 ? "text-strong-foreground" : "text-transparent",
                  hovered !== null && hovered !== index && "opacity-40",
                )}
              >
                {month.count > 0 ? month.count : "0"}
              </span>
              <div
                className={cn(
                  "mx-auto w-full max-w-10 rounded-t-lg bg-primary transition-[height,opacity] duration-500 ease-out",
                  hovered !== null && hovered !== index && "opacity-40",
                )}
                style={{ height: `${height}%` }}
              />
              <span className="sr-only">
                {month.long}: {month.count}
              </span>
            </li>
          )
        })}
      </ul>
      <ul className="mt-2 flex gap-2 sm:gap-3" aria-hidden>
        {months.map((month) => (
          <li key={month.key} className="flex-1 text-center text-xs capitalize text-muted-foreground">
            {month.short}
          </li>
        ))}
      </ul>
    </div>
  )
}

// ─── Painel ──────────────────────────────────────────────────────────────────

function Kpi({
  icon: Icon,
  label,
  value,
  hint,
  tone,
}: {
  icon: LucideIcon
  label: string
  value: string | number
  hint?: string
  tone: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-3xl border border-border/60 bg-card p-4 sm:flex-col sm:items-start sm:gap-4 sm:p-5">
      <span className={cn("grid size-10 shrink-0 place-items-center rounded-full", tone)}>
        <Icon className="size-5" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="text-2xl font-semibold tabular-nums leading-none tracking-tight text-foreground sm:text-4xl">{value}</p>
        <p className="mt-1.5 truncate text-xs font-medium text-muted-foreground sm:text-sm">{label}</p>
        {hint && <p className="mt-0.5 hidden text-xs text-subtle-foreground sm:block">{hint}</p>}
      </div>
    </div>
  )
}

export function ApplicationsInsights({
  candidaturas,
  counts,
  activeFilter,
  onSelect,
}: {
  candidaturas: Candidatura[]
  counts: Record<StatusCandidatura, number>
  activeFilter: StatusCandidatura | "TODAS"
  onSelect: (status: StatusCandidatura | "TODAS") => void
}) {
  const total = candidaturas.length
  if (total === 0) return null

  const decided = counts.APROVADA + counts.REPROVADA
  const approvalRate = decided > 0 ? Math.round((counts.APROVADA / decided) * 100) : null
  const feedbacks = candidaturas.reduce((sum, c) => sum + (c.totalFeedbacks ?? 0), 0)

  return (
    <section aria-label="Resumo das candidaturas" className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <Kpi
          icon={Send}
          label="Candidaturas enviadas"
          value={total}
          hint="Desde o início da sua jornada"
          tone="bg-primary-subtle text-primary"
        />
        <Kpi
          icon={Hourglass}
          label="Em andamento"
          value={counts.EM_ANDAMENTO}
          hint="Processos ativos agora"
          tone="bg-primary-subtle text-primary"
        />
        <Kpi
          icon={CheckCircle2}
          label="Taxa de aprovação"
          value={approvalRate === null ? "—" : approvalRate + "%"}
          hint={decided > 0 ? counts.APROVADA + " de " + decided + " finalizadas" : "Aparece após o 1º resultado"}
          tone="bg-primary-subtle text-primary"
        />
        <Kpi
          icon={MessageSquareQuote}
          label="Feedbacks recebidos"
          value={feedbacks}
          hint="Retornos das empresas"
          tone="bg-primary-subtle text-primary"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.15fr_1fr]">
        <div className="min-w-0 rounded-[28px] border border-border/60 bg-card p-5 sm:p-6">
          <h2 className="text-sm font-semibold text-foreground">Situação dos processos</h2>
          <p className="mb-5 mt-0.5 text-xs text-muted-foreground">Toque numa fatia para filtrar a lista</p>
          <StatusDonut counts={counts} total={total} activeFilter={activeFilter} onSelect={onSelect} />
        </div>
        <div className="min-w-0 rounded-[28px] border border-border/60 bg-card p-5 sm:p-6">
          <h2 className="text-sm font-semibold text-foreground">Atividade</h2>
          <p className="mb-5 mt-0.5 text-xs text-muted-foreground">Candidaturas enviadas por mês</p>
          <MonthlyBars candidaturas={candidaturas} />
        </div>
      </div>
    </section>
  )
}
