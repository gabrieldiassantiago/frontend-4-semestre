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
  const reduce = useReducedMotion()
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
    <dl className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      {stats.map(({ label, value, hint, icon: Icon, tone }, index) => (
        <motion.div
          key={label}
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
          className={`flex flex-col justify-between gap-2 rounded-xl border p-3.5 ${index === 1 ? "border-primary/15 bg-primary-subtle/60" : "border-border/60 bg-card"}`}
        >
          <div className="flex items-center justify-between gap-2">
            <dt className="text-[11px] font-medium text-muted-foreground">{label}</dt>
            <span className={`grid size-7 shrink-0 place-items-center rounded-lg ${tone}`}>
              <Icon aria-hidden className="size-3.5" />
            </span>
          </div>

          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <dd className="text-2xl font-semibold tracking-tight tabular-nums text-foreground">
              <CountUp value={value} />
            </dd>
            <p className="text-[10px] text-muted-foreground">{hint}</p>
          </div>
        </motion.div>
      ))}
    </dl>
  )
}
