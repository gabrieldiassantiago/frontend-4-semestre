"use client"

import { useId, useMemo, useState } from "react"
import Link from "next/link"
import { motion, useReducedMotion } from "framer-motion"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import type { Vaga } from "@/lib/types/vaga.types"
import { MODALIDADE_LABELS } from "@/lib/types/vaga.types"
import type { Candidatura } from "@/lib/types/candidatura.types"
import { ETAPAS, ETAPA_LABELS } from "@/lib/types/candidatura.types"
import { cn } from "@/lib/utils"

const colors = ["var(--primary)", "var(--info)", "var(--warning)"]
const tooltipStyle = { borderRadius: 16, border: "1px solid var(--border)", background: "var(--card)", color: "var(--foreground)", boxShadow: "var(--shadow-raised)", fontSize: 12 }
const axis = { fill: "var(--muted-foreground)", fontSize: 11 }

export default function DashboardCharts({ vagas, candidaturas }: { vagas: Vaga[]; candidaturas: Candidatura[] }) {
  const reducedMotion = useReducedMotion()
  const gradient = useId().replace(/:/g, "")
  const [weeks, setWeeks] = useState(8)
  const [metric, setMetric] = useState<"candidaturas" | "vagas">("candidaturas")
  const [selectedModality, setSelectedModality] = useState<string | null>(null)
  const funnel = ETAPAS.map(etapa => ({ label: ETAPA_LABELS[etapa], count: candidaturas.filter(c => c.etapaAtual === etapa).length }))
  const modalities = (["PRESENCIAL", "REMOTO", "HIBRIDO"] as const).map((key, i) => ({ label: MODALIDADE_LABELS[key], count: vagas.filter(v => v.modalidade === key).length, fill: colors[i] }))
  const selected = modalities.find(item => item.label === selectedModality)
  const timeline = useMemo(() => {
    const end = new Date()
    end.setHours(24, 0, 0, 0)
    return Array.from({ length: weeks }, (_, index) => {
      const start = new Date(end)
      start.setDate(start.getDate() - (weeks - index) * 7)
      const until = new Date(start)
      until.setDate(until.getDate() + 7)
      const last = new Date(until)
      last.setDate(last.getDate() - 1)
      const count = (items: { createdAt?: string }[]) => items.filter(item => {
        const date = item.createdAt ? new Date(item.createdAt).getTime() : NaN
        return date >= start.getTime() && date < until.getTime()
      }).length
      const format = (date: Date) => date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
      return { label: format(start), period: format(start) + " a " + format(last), vagas: count(vagas), candidaturas: count(candidaturas) }
    })
  }, [vagas, candidaturas, weeks])
  const total = timeline.reduce((sum, point) => sum + point[metric], 0)
  const undated = (metric === "vagas" ? vagas : candidaturas).filter(item => !item.createdAt || Number.isNaN(new Date(item.createdAt).getTime())).length
  const entrance = { initial: { opacity: 0, y: reducedMotion ? 0 : 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: reducedMotion ? 0 : .35 } }
  return (
    <div className="mt-8 space-y-5">
      <div className="grid gap-5 lg:grid-cols-2">
        <motion.section {...entrance} aria-labelledby="funnel-title" className="min-w-0 rounded-2xl border border-border bg-card p-5 sm:p-6">
          <p className="text-xs font-medium text-muted-foreground">Funil de seleção</p>
          <h2 id="funnel-title" className="mt-1 text-base font-semibold tracking-tight">Candidaturas por etapa</h2>
          <p className="mt-1 text-xs text-muted-foreground">Distribuição atual de todas as candidaturas.</p>
          {candidaturas.length ? <div className="mt-5 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={funnel} layout="vertical" margin={{ left: 0, right: 20 }} accessibilityLayer>
                <CartesianGrid horizontal={false} stroke="var(--border-subtle)" />
                <XAxis type="number" allowDecimals={false} tick={axis} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="label" width={112} tick={axis} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--primary-subtle)" }} />
                <Bar dataKey="count" name="Candidaturas" fill="var(--primary)" radius={[0, 6, 6, 0]} barSize={18} isAnimationActive={!reducedMotion} animationDuration={650} />
              </BarChart>
            </ResponsiveContainer>
          </div> : <EmptyChart text="As etapas aparecerão quando suas vagas receberem candidaturas." />}
          <details className="mt-4 border-t border-border-subtle pt-3 text-xs">
            <summary className="cursor-pointer font-medium text-muted-foreground">Consultar valores por etapa</summary>
            <dl className="mt-3 space-y-2">{funnel.map(item => <div key={item.label} className="flex justify-between"><dt>{item.label}</dt><dd className="font-semibold tabular-nums">{item.count}</dd></div>)}</dl>
          </details>
          <Link href="/empresa/processos" className="mt-4 inline-block text-xs font-semibold text-primary hover:underline">Abrir processos →</Link>
        </motion.section>
        <motion.section {...entrance} aria-labelledby="modalities-title" className="min-w-0 rounded-2xl border border-border bg-card p-5 sm:p-6">
          <p className="text-xs font-medium text-muted-foreground">Seu portfólio</p>
          <h2 id="modalities-title" className="mt-1 text-base font-semibold tracking-tight">Vagas por modalidade</h2>
          <p className="mt-1 text-xs text-muted-foreground">Selecione uma modalidade para destacar sua participação.</p>
          {vagas.length ? <>
            <div className="relative mt-5 h-52">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <PieChart accessibilityLayer>
                  <Pie data={modalities} dataKey="count" nameKey="label" innerRadius="65%" outerRadius="90%" paddingAngle={3} stroke="var(--card)" strokeWidth={3} isAnimationActive={!reducedMotion} animationDuration={700}>
                    {modalities.map(item => <Cell key={item.label} fill={item.fill} opacity={!selectedModality || selectedModality === item.label ? 1 : .2} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center" aria-live="polite">
                <span className="text-3xl font-semibold tabular-nums">{selected ? Math.round(selected.count / vagas.length * 100) + "%" : vagas.length}</span>
                <span className="text-xs text-muted-foreground">{selected?.label ?? "vagas no total"}</span>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              {modalities.map(item => <button key={item.label} type="button" aria-pressed={selectedModality === item.label} onClick={() => setSelectedModality(selectedModality === item.label ? null : item.label)} className={cn("flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-primary", selectedModality === item.label && "bg-primary-subtle")}>
                <span className="size-2.5 rounded-full" style={{ background: item.fill }} /><span>{item.label}</span><span className="ml-auto tabular-nums text-muted-foreground">{Math.round(item.count / vagas.length * 100)}%</span><span className="w-6 text-right font-semibold tabular-nums">{item.count}</span>
              </button>)}
            </div>
          </> : <EmptyChart text="Publique sua primeira vaga para acompanhar as modalidades." />}
          <Link href="/empresa/vagas" className="mt-4 inline-block text-xs font-semibold text-primary hover:underline">Gerenciar vagas →</Link>
        </motion.section>
      </div>
      <motion.section {...entrance} aria-labelledby="activity-title" className="min-w-0 rounded-2xl border border-border bg-card p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div><p className="text-xs font-medium text-muted-foreground">Atividade ao longo do tempo</p><h2 id="activity-title" className="mt-1 text-base font-semibold tracking-tight">O ritmo do seu recrutamento</h2></div>
          <label className="flex items-center gap-2 text-xs text-muted-foreground">Período
            <select aria-label="Período do gráfico" value={weeks} onChange={event => setWeeks(Number(event.target.value))} className="min-h-11 rounded-full border border-border bg-card px-3 font-medium text-foreground focus-visible:outline-primary">
              {[4, 8, 12].map(value => <option key={value} value={value}>Últimas {value} semanas</option>)}
            </select>
          </label>
        </div>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
          <div className="inline-flex rounded-full bg-muted p-1" role="group" aria-label="Métrica do gráfico">
            {(["candidaturas", "vagas"] as const).map(value => <button type="button" key={value} aria-pressed={metric === value} onClick={() => setMetric(value)} className={cn("relative min-h-10 rounded-full px-4 text-xs font-semibold focus-visible:outline-primary", metric === value ? "text-primary" : "text-muted-foreground")}>
              {metric === value && <motion.span layoutId={gradient + "-metric"} transition={{ duration: reducedMotion ? 0 : .2 }} className="absolute inset-0 rounded-full bg-primary-subtle" />}<span className="relative">{value === "vagas" ? "Vagas publicadas" : "Candidaturas recebidas"}</span>
            </button>)}
          </div>
          <p aria-live="polite" className="text-sm text-muted-foreground"><strong className="text-xl font-semibold tabular-nums text-foreground">{total}</strong> {metric} no período</p>
        </div>
        {total ? <div className="mt-6 h-64 w-full">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <AreaChart data={timeline} margin={{ top: 10, right: 12, left: -24, bottom: 0 }} accessibilityLayer>
              <defs><linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--primary)" stopOpacity={.22} /><stop offset="100%" stopColor="var(--primary)" stopOpacity={.01} /></linearGradient></defs>
              <CartesianGrid vertical={false} stroke="var(--border-subtle)" />
              <XAxis dataKey="label" tick={axis} axisLine={false} tickLine={false} minTickGap={24} />
              <YAxis tick={axis} allowDecimals={false} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} labelFormatter={(_, payload) => payload?.[0]?.payload?.period ?? "Semana"} />
              <Area type="monotone" dataKey={metric} name={metric === "vagas" ? "Vagas publicadas" : "Candidaturas recebidas"} stroke="var(--primary)" strokeWidth={2.5} fill={"url(#" + gradient + ")"} activeDot={{ r: 5, stroke: "var(--card)", strokeWidth: 3 }} isAnimationActive={!reducedMotion} animationDuration={650} />
            </AreaChart>
          </ResponsiveContainer>
        </div> : <EmptyChart text={"Nenhuma " + (metric === "vagas" ? "vaga publicada" : "candidatura recebida") + " neste período. Experimente ampliar o intervalo."} />}
        <p className="mt-3 text-xs text-muted-foreground">Contagem semanal pela data de criação, incluindo a semana atual.{undated > 0 ? " " + undated + " registros sem data válida não entram nesta série." : ""}</p>
        <details className="mt-4 border-t border-border-subtle pt-3 text-xs"><summary className="cursor-pointer font-medium text-muted-foreground">Consultar dados por semana</summary>
          <div className="mt-3 overflow-x-auto"><table className="w-full text-left"><caption className="sr-only">Atividade nas últimas {weeks} semanas</caption><thead><tr><th scope="col" className="py-2">Semana</th><th scope="col">Vagas</th><th scope="col">Candidaturas</th></tr></thead><tbody>{timeline.map(item => <tr key={item.period} className="border-t border-border-subtle"><th scope="row" className="py-2 font-normal">{item.period}</th><td>{item.vagas}</td><td>{item.candidaturas}</td></tr>)}</tbody></table></div>
        </details>
      </motion.section>
    </div>
  )
}

function EmptyChart({ text }: { text: string }) {
  return <div className="mt-5 flex h-64 items-center justify-center rounded-xl bg-muted px-6 text-center text-sm leading-relaxed text-muted-foreground">{text}</div>
}
