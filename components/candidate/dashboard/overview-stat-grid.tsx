"use client"

import { useEffect } from "react"
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "framer-motion"
import { CheckCircle2, FileText, Hourglass, XCircle, type LucideIcon } from "lucide-react"

interface OverviewStatGridProps {
  total: number
  inProgress: number
  approved: number
  closed: number
}

function CountUp({ value }: { value: number }) {
  const reduce = useReducedMotion()
  const count = useMotionValue(reduce ? value : 0)
  const rounded = useTransform(count, (latest) => Math.round(latest))

  useEffect(() => {
    if (reduce) {
      count.set(value)
      return
    }
    const controls = animate(count, value, { duration: 0.8, ease: [0.22, 1, 0.36, 1] })
    return () => controls.stop()
  }, [count, reduce, value])

  return <motion.span>{rounded}</motion.span>
}

function percentOf(value: number, total: number) {
  return total === 0 ? "0%" : `${Math.round((value / total) * 100)}%`
}

export function OverviewStatGrid({ total, inProgress, approved, closed }: OverviewStatGridProps) {
  const stats: { label: string; value: number; hint: string; icon: LucideIcon; tone: string }[] = [
    {
      label: "Candidaturas",
      value: total,
      hint: "Total enviadas",
      icon: FileText,
      tone: "bg-primary-subtle text-primary",
    },
    {
      label: "Em andamento",
      value: inProgress,
      hint: `${percentOf(inProgress, total)} do total`,
      icon: Hourglass,
      tone: "bg-info-subtle text-info",
    },
    {
      label: "Aprovadas",
      value: approved,
      hint: `${percentOf(approved, total)} do total`,
      icon: CheckCircle2,
      tone: "bg-success-subtle text-success",
    },
    {
      label: "Encerradas",
      value: closed,
      hint: `${percentOf(closed, total)} do total`,
      icon: XCircle,
      tone: "bg-muted text-muted-foreground",
    },
  ]

  return (
    <dl className="grid grid-cols-2 gap-3.5 lg:grid-cols-4 lg:gap-4">
      {stats.map(({ label, value, hint, icon: Icon, tone }, index) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
          className="group flex flex-col justify-between gap-4 rounded-2xl border border-border/70 bg-card p-4 shadow-2xs transition-all hover:border-border hover:shadow-card sm:p-5"
        >
          <div className="flex items-center justify-between gap-2">
            <dt className="text-xs font-medium text-muted-foreground sm:text-sm">{label}</dt>
            <span className={`grid size-8 shrink-0 place-items-center rounded-xl transition-transform duration-300 group-hover:scale-105 ${tone}`}>
              <Icon aria-hidden className="size-4" />
            </span>
          </div>

          <div className="flex items-baseline justify-between gap-2">
            <dd className="text-2xl font-semibold tracking-tight tabular-nums text-foreground sm:text-3xl">
              <CountUp value={value} />
            </dd>
            <p className="truncate text-[11px] text-muted-foreground">{hint}</p>
          </div>
        </motion.div>
      ))}
    </dl>
  )
}