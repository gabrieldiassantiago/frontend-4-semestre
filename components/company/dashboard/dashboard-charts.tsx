"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { useReducedMotion } from "framer-motion"
import { ROUTES } from "@/lib/config/routes"
import {
  etapaLabel,
  STATUS_LABELS,
  etapasDaVaga,
  type Candidatura,
  type StatusCandidatura,
} from "@/lib/types/candidatura.types"
import type { Vaga } from "@/lib/types/vaga.types"
import { cn } from "@/lib/utils"
import { SegmentedControl } from "../segmented-control"
import { weeklyBuckets } from "./metrics"

const axis = { fill: "var(--muted-foreground)", fontSize: 11 }

const METRICS = {
  candidaturas: { label: "Candidaturas", color: "var(--primary)" },
  vagas: { label: "Vagas publicadas", color: "var(--mint-strong)" },
} as const

type Metric = keyof typeof METRICS

function Panel({ className, children, ...props }: React.ComponentProps<"section">) {
  return (
    <section className={cn("flex min-w-0 flex-col rounded-2xl border border-border bg-card p-5 sm:p-5", className)} {...props}>
      {children}
    </section>
  )
}

export function ActivityChart({ vagas, candidaturas, className }: { vagas: Vaga[]; candidaturas: Candidatura[]; className?: string }) {
  const reducedMotion = useReducedMotion()
  const [weeks, setWeeks] = useState(8)
  const [metric, setMetric] = useState<Metric>("candidaturas")
  const timeline = useMemo(() => weeklyBuckets(vagas, candidaturas, weeks), [vagas, candidaturas, weeks])
  const total = timeline.reduce((sum, point) => sum + point[metric], 0)
  const average = total / weeks
  const config = METRICS[metric]

  return (
    <Panel aria-labelledby="activity-title" className={className}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 id="activity-title" className="text-base font-semibold tracking-tight text-foreground">
            Atividade semanal
          </h2>
        </div>
        <SegmentedControl
          label="Período do gráfico"
          value={String(weeks)}
          onChange={(value) => setWeeks(Number(value))}
          options={[4, 8, 12].map((value) => ({ value: String(value), label: `${value} sem` }))}
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Métrica do gráfico">
        {(Object.keys(METRICS) as Metric[]).map((key) => {
          const sum = timeline.reduce((acc, point) => acc + point[key], 0)
          const selected = metric === key
          return (
            <button
              key={key}
              type="button"
              aria-pressed={selected}
              onClick={() => setMetric(key)}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-left transition-colors",
                selected ? "border-primary-soft bg-primary-subtle" : "border-border hover:bg-muted",
              )}
            >
              <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <span aria-hidden className="size-2 rounded-full" style={{ background: METRICS[key].color }} />
                {METRICS[key].label}
              </span>
              <span className="text-sm font-semibold tabular-nums text-ink">{sum}</span>
            </button>
          )
        })}
      </div>

      {total ? (
        <div className="mt-4 h-36 w-full sm:h-44">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <BarChart data={timeline} margin={{ top: 8, right: 8, left: -24, bottom: 0 }} accessibilityLayer>
              <CartesianGrid vertical={false} stroke="var(--border-subtle)" />
              <XAxis dataKey="label" tick={axis} axisLine={false} tickLine={false} minTickGap={24} />
              <YAxis tick={axis} allowDecimals={false} axisLine={false} tickLine={false} />
              <Tooltip
                content={<ChartTooltip label={config.label} />}
                cursor={{ fill: "var(--surface)" }}
              />
              <Bar
                dataKey={metric}
                name={config.label}
                fill={config.color}
                radius={[4, 4, 0, 0]}
                maxBarSize={32}
                isAnimationActive={!reducedMotion}
                animationDuration={600}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <EmptyChart text="Nenhum registro neste período. Experimente ampliar o intervalo." />
      )}

      <p className="mt-3 text-xs text-muted-foreground">
        Média de <strong className="font-semibold tabular-nums text-strong-foreground">{average.toFixed(1).replace(".", ",")}</strong>{" "}
        {metric === "vagas" ? "vagas" : "candidaturas"} por semana nas últimas {weeks} semanas.
      </p>

      <details className="mt-3 border-t border-border-subtle pt-3 text-xs">
        <summary className="cursor-pointer font-medium text-muted-foreground">Ver dados por semana</summary>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left">
            <caption className="sr-only">Atividade nas últimas {weeks} semanas</caption>
            <thead>
              <tr className="text-muted-foreground">
                <th scope="col" className="py-2 font-medium">Semana</th>
                <th scope="col" className="font-medium">Vagas</th>
                <th scope="col" className="font-medium">Candidaturas</th>
              </tr>
            </thead>
            <tbody>
              {timeline.map((item) => (
                <tr key={item.period} className="border-t border-border-subtle">
                  <th scope="row" className="py-2 font-normal">{item.period}</th>
                  <td className="tabular-nums">{item.vagas}</td>
                  <td className="tabular-nums">{item.candidaturas}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </Panel>
  )
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ value: number; payload: { period: string } }>
  label: string
}) {
  if (!active || !payload?.length) return null
  const point = payload[0]
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2 text-xs shadow-overlay">
      <p className="text-muted-foreground">{point.payload.period}</p>
      <p className="mt-0.5 font-semibold text-foreground">
        <span className="tabular-nums">{point.value}</span> {label.toLowerCase()}
      </p>
    </div>
  )
}

const STATUS_COLORS: Record<StatusCandidatura, string> = {
  EM_ANDAMENTO: "bg-primary",
  APROVADA: "bg-success",
  REPROVADA: "bg-danger",
  CANCELADA: "bg-border-strong",
}

export function FunnelCard({ candidaturas }: { candidaturas: Candidatura[] }) {
  const total = candidaturas.length
  // Cada vaga tem seu próprio fluxo: só conta quem passou pela etapa dentro do fluxo da sua vaga.
  const flows = candidaturas.map((item) => {
    const flow = etapasDaVaga(item.etapasVaga)
    return { flow, current: flow.indexOf(item.etapaAtual) }
  })
  const stages = [...new Set(flows.flatMap(({ flow }) => flow))].map((etapa) => {
    const reached = flows.filter(({ flow, current }) => {
      const position = flow.indexOf(etapa)
      return position !== -1 && position <= current
    }).length
    const now = candidaturas.filter((item) => item.etapaAtual === etapa && item.status === "EM_ANDAMENTO").length
    return { etapa, reached, now, percent: total ? Math.round((reached / total) * 100) : 0 }
  })
  const statuses = (Object.keys(STATUS_COLORS) as StatusCandidatura[])
    .map((status) => ({ status, count: candidaturas.filter((item) => item.status === status).length }))
    .filter((item) => item.count > 0)

  return (
    <Panel aria-labelledby="funnel-title">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 id="funnel-title" className="text-base font-semibold tracking-tight text-foreground">
            Funil de seleção
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">Quantos candidatos chegaram a cada etapa.</p>
        </div>
      </div>

      {total ? (
        <>
          <ol className="mt-5 flex flex-col gap-3">
            {stages.map((stage) => (
              <li key={stage.etapa}>
                <div className="flex items-baseline justify-between gap-2 text-sm">
                  <span className="truncate font-medium text-strong-foreground">{etapaLabel(stage.etapa, candidaturas.flatMap(item => item.etapasVaga ?? []))}</span>
                  <span className="shrink-0 tabular-nums text-muted-foreground">
                    <strong className="font-semibold text-foreground">{stage.reached}</strong>
                    <span className="ml-1.5 text-xs">{stage.percent}%</span>
                  </span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted" aria-hidden>
                  <div
                    className="h-full rounded-full bg-primary transition-[width] duration-700"
                    style={{ width: `${Math.max(stage.percent, stage.reached ? 3 : 0)}%`, opacity: 0.35 + stage.percent / 155 }}
                  />
                </div>
                {stage.now > 0 && (
                  <p className="mt-1 text-[11px] text-subtle-foreground">
                    {stage.now} {stage.now === 1 ? "pessoa está" : "pessoas estão"} nesta etapa agora
                  </p>
                )}
              </li>
            ))}
          </ol>

          <div className="mt-6 border-t border-border-subtle pt-4">
            <p className="text-xs font-medium text-muted-foreground">Situação das candidaturas</p>
            <div className="mt-2.5 flex h-2 overflow-hidden rounded-full bg-muted" aria-hidden>
              {statuses.map((item) => (
                <span key={item.status} className={STATUS_COLORS[item.status]} style={{ width: `${(item.count / total) * 100}%` }} />
              ))}
            </div>
            <ul className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
              {statuses.map((item) => (
                <li key={item.status} className="flex items-center gap-2">
                  <span aria-hidden className={cn("size-2 rounded-full", STATUS_COLORS[item.status])} />
                  <span className="truncate text-muted-foreground">{STATUS_LABELS[item.status]}</span>
                  <span className="ml-auto font-semibold tabular-nums text-foreground">{item.count}</span>
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : (
        <EmptyChart text="As etapas aparecem quando suas vagas receberem candidaturas." />
      )}

      <Link
        href={ROUTES.company.processes}
        className="group mt-auto inline-flex items-center gap-1 pt-5 text-sm font-semibold text-primary"
      >
        Abrir processos seletivos
        <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </Panel>
  )
}

function EmptyChart({ text }: { text: string }) {
  return (
    <div className="mt-5 flex h-36 items-center justify-center rounded-xl border border-dashed border-border bg-surface px-6 text-center text-sm leading-relaxed text-muted-foreground">
      {text}
    </div>
  )
}
