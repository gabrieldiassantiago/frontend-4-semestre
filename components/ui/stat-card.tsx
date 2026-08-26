import { cn } from "@/lib/utils"

const TONES = {
  primary: "bg-primary-subtle text-primary-subtle-foreground",
  success: "bg-success-subtle text-success-foreground",
  info: "bg-info-subtle text-info",
  warning: "bg-warning-subtle text-warning-foreground",
  neutral: "bg-muted text-strong-foreground",
} as const

/** Métrica de topo de painel. Compartilhada pelas áreas de empresa e candidato. */
export function StatCard({
  label,
  value,
  note,
  icon: Icon,
  tone = "neutral",
  className,
}: {
  label: string
  value: string | number
  note?: string
  icon?: React.ComponentType<{ className?: string }>
  tone?: keyof typeof TONES
  className?: string
}) {
  return (
    <div className={cn("rounded-card border border-border bg-card p-5 shadow-card", className)}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {Icon && (
          <span className={cn("grid size-9 shrink-0 place-items-center rounded-xl", TONES[tone])}>
            <Icon className="size-4.5" aria-hidden />
          </span>
        )}
      </div>
      <p className="mt-4 text-3xl font-bold tracking-tight tabular-nums text-foreground">{value}</p>
      {note && <p className="mt-1.5 text-xs text-subtle-foreground">{note}</p>}
    </div>
  )
}
