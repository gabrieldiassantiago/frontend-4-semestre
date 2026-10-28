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
    const controls = animate(count, value, { duration: 0.9, ease: [0.22, 1, 0.36, 1] })
    return () => controls.stop()
  }, [count, reduce, value])

  return <motion.span>{rounded}</motion.span>
}

function percentOf(value: number, total: number) {
  return total === 0 ? "0%" : `${Math.round((value / total) * 100)}%`
}

export function OverviewStatGrid({ total, inProgress, approved, closed }: OverviewStatGridProps) {
  const stats: { label: string; value: number; hint: string; icon: LucideIcon; tone: string }[] = [
    { label: "Candidaturas", value: total, hint: "Enviadas até hoje", icon: FileText, tone: "bg-primary-subtle text-primary" },
    { label: "Em andamento", value: inProgress, hint: `${percentOf(inProgress, total)} do total`, icon: Hourglass, tone: "bg-info-subtle text-info" },
    { label: "Aprovadas", value: approved, hint: `${percentOf(approved, total)} do total`, icon: CheckCircle2, tone: "bg-success-subtle text-success" },
    { label: "Encerradas", value: closed, hint: `${percentOf(closed, total)} do total`, icon: XCircle, tone: "bg-muted text-muted-foreground" },
  ]

  return (
    <dl className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
      {stats.map(({ label, value, hint, icon: Icon, tone }, index) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ y: -3 }}
          className="group flex flex-col justify-between gap-6 rounded-2xl border border-border-subtle bg-card p-5 shadow-card transition-shadow hover:shadow-raised"
        >
          <div className="flex items-center gap-3">
            <span className={`grid size-10 place-items-center rounded-full transition-transform duration-300 group-hover:scale-110 ${tone}`}>
              <Icon aria-hidden className="size-[18px]" />
            </span>
            <dt className="text-sm font-medium text-foreground">{label}</dt>
          </div>
          <div className="flex items-end justify-between gap-3">
            <dd className="text-4xl font-semibold leading-none tracking-tight tabular-nums text-foreground">
              <CountUp value={value} />
            </dd>
            <p className="pb-1 text-xs text-muted-foreground">{hint}</p>
          </div>
        </motion.div>
      ))}
    </dl>
  )
}
