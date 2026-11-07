import Link from "next/link"
import { ArrowDownRight, ArrowUpRight, Minus, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

const TONES = {
  primary: { icon: "bg-primary-subtle text-primary", bar: "bg-primary" },
  info: { icon: "bg-info-subtle text-info", bar: "bg-info" },
  warning: { icon: "bg-warning-subtle text-warning-foreground", bar: "bg-warning" },
  success: { icon: "bg-success-subtle text-success-foreground", bar: "bg-success" },
} as const

export function KpiCard({
  label,
  value,
  icon: Icon,
  tone,
  href,
  note,
  delta,
  spark,
  progress,
}: {
  label: string
  value: string | number
  icon: LucideIcon
  tone: keyof typeof TONES
  href: string
  note: string
  /** Variação percentual contra o período anterior. `null` = sem base de comparação. */
  delta?: number | null
  /** Pequena série para o mini gráfico de barras. */
  spark?: number[]
  /** 0–100 para uma barra de progresso. */
  progress?: number | null
}) {
  const colors = TONES[tone]
  const max = spark ? Math.max(1, ...spark) : 1

  return (
    <Link
      href={href}
      className="group flex min-w-0 flex-col rounded-3xl border border-border/80 bg-card p-5 shadow-[0_2px_8px_-4px_rgba(32,29,29,0.08)] transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-border-strong hover:shadow-[0_12px_32px_-16px_rgba(32,29,29,0.2)] motion-reduce:transform-none sm:p-6"
    >
      <div className="flex items-center gap-2.5 sm:gap-3">
        <span className="hidden size-10 shrink-0 place-items-center rounded-full bg-surface text-strong-foreground sm:grid">
          <Icon aria-hidden className="size-[18px]" strokeWidth={1.6} />
        </span>
        <p className="min-w-0 flex-1 text-xs font-medium leading-5 text-muted-foreground sm:text-sm">{label}</p>
        <ArrowUpRight
          aria-hidden
          className="size-4 shrink-0 text-subtle-foreground transition-[color,transform] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground motion-reduce:transform-none"
        />
      </div>

      <div className="mt-6 flex flex-1 items-end justify-between gap-3 sm:mt-7">
        <div className="min-w-0">
          <p className="text-4xl font-medium tracking-[-0.06em] tabular-nums text-foreground sm:text-[42px]">{value}</p>
          <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs leading-5 text-muted-foreground">
            {delta !== undefined && <DeltaPill delta={delta} />}
            <span>{note}</span>
          </div>
        </div>

        {spark && (
          <div aria-hidden className="hidden h-10 shrink-0 items-end gap-[3px] sm:flex">
            {spark.map((point, index) => (
              <span
                key={index}
                className={cn(
                  "w-1.5 rounded-full transition-colors",
                  index === spark.length - 1 ? colors.bar : "bg-border group-hover:bg-border-strong",
                )}
                style={{ height: `${Math.max(12, (point / max) * 100)}%` }}
              />
            ))}
          </div>
        )}
      </div>

      {progress !== undefined && (
        <div className="mt-5 h-1 w-full overflow-hidden rounded-full bg-surface" aria-hidden>
          <div className={cn("h-full rounded-full", colors.bar)} style={{ width: `${progress ?? 0}%` }} />
        </div>
      )}
    </Link>
  )
}

function DeltaPill({ delta }: { delta: number | null }) {
  if (delta === null) {
    return <span className="rounded-full bg-success-subtle px-1.5 py-0.5 font-semibold text-success-foreground">Novo</span>
  }
  const Icon = delta > 0 ? ArrowUpRight : delta < 0 ? ArrowDownRight : Minus
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-semibold tabular-nums",
        delta > 0 && "bg-success-subtle text-success-foreground",
        delta < 0 && "bg-danger-subtle text-danger-foreground",
        delta === 0 && "bg-muted text-muted-foreground",
      )}
    >
      <Icon aria-hidden className="size-3" />
      {Math.abs(delta)}%
      <span className="sr-only">{delta > 0 ? "de aumento" : delta < 0 ? "de queda" : "sem variação"}</span>
    </span>
  )
}
