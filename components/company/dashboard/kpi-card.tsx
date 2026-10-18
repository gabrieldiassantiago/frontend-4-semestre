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
      className="group flex min-w-0 flex-col rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/30 sm:p-5"
    >
      <div className="flex items-center gap-2.5 sm:gap-3">
        <span className={cn("grid size-8 shrink-0 place-items-center rounded-xl sm:size-9", colors.icon)}>
          <Icon aria-hidden className="size-[18px]" />
        </span>
        <p className="min-w-0 flex-1 truncate text-xs font-medium text-muted-foreground sm:text-sm">{label}</p>
        <ArrowUpRight
          aria-hidden
          className="size-4 shrink-0 text-subtle-foreground opacity-0 transition-opacity group-hover:opacity-100"
        />
      </div>

      <div className="mt-4 flex items-end justify-between gap-3 sm:mt-5">
        <div className="min-w-0">
          <p className="text-2xl font-semibold tracking-tight tabular-nums text-foreground sm:text-3xl">{value}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            {delta !== undefined && <DeltaPill delta={delta} />}
            <span className="truncate">{note}</span>
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
        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-muted" aria-hidden>
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
