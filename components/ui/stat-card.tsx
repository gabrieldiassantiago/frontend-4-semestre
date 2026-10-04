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
  note?: React.ReactNode
  icon?: React.ComponentType<{ className?: string }>
  tone?: keyof typeof TONES
  className?: string
}) {
  return (
    <div className={cn("flex min-w-0 flex-col rounded-card border border-border bg-card p-4 sm:p-5", className)}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium text-muted-foreground sm:text-sm">{label}</p>
        {Icon && (
          <span className={cn("grid size-8 shrink-0 place-items-center rounded-lg sm:size-9", TONES[tone])}>
            <Icon className="size-4" aria-hidden />
          </span>
        )}
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight tabular-nums text-foreground sm:mt-4 sm:text-3xl">{value}</p>
      {note && <p className="mt-1 text-xs leading-snug text-muted-foreground">{note}</p>}
    </div>
  )
}
