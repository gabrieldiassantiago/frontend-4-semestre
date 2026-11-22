"use client"

import { useEffect } from "react"
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "framer-motion"
import { CheckCircle2, FileText, Hourglass, XCircle, type LucideIcon } from "lucide-react"
import { TickBar } from "@/components/ui/tick-bar"
import { cn } from "@/lib/utils"

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
  return total === 0 ? 0 : Math.round((value / total) * 100)
}

export function OverviewStatGrid({ total, inProgress, approved, closed }: OverviewStatGridProps) {
  const reduce = useReducedMotion()
  const stats: { label: string; value: number; percent: number; hint: string; icon: LucideIcon }[] = [
    { label: "Candidaturas", value: total, percent: total > 0 ? 100 : 0, hint: "Total enviadas", icon: FileText },
    { label: "Em andamento", value: inProgress, percent: percentOf(inProgress, total), hint: `${percentOf(inProgress, total)}% do total`, icon: Hourglass },
    { label: "Aprovadas", value: approved, percent: percentOf(approved, total), hint: `${percentOf(approved, total)}% do total`, icon: CheckCircle2 },
    { label: "Encerradas", value: closed, percent: percentOf(closed, total), hint: `${percentOf(closed, total)}% do total`, icon: XCircle },
  ]

  return (
    <dl className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      {stats.map(({ label, value, percent, hint, icon: Icon }, index) => {
        const highlighted = index === 1
        return (
          <motion.div
            key={label}
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "flex flex-col gap-4 rounded-3xl border p-4 sm:p-5",
              highlighted ? "border-primary/15 bg-primary-subtle" : "border-border/60 bg-card",
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
              <span
                className={cn(
                  "grid size-9 shrink-0 place-items-center rounded-full",
                  highlighted ? "bg-card text-primary" : "bg-primary-subtle text-primary",
                )}
              >
                <Icon aria-hidden strokeWidth={1.75} className="size-4" />
              </span>
            </div>

            <dd className="text-4xl font-semibold leading-none tracking-tight tabular-nums text-foreground">
              <CountUp value={value} />
            </dd>

            <div>
              <TickBar value={percent} ticks={20} className="h-5" trackClassName={highlighted ? "bg-primary/15" : "bg-border"} />
              <p className="mt-2 text-[11px] text-muted-foreground">{hint}</p>
            </div>
          </motion.div>
        )
      })}
    </dl>
  )
}
