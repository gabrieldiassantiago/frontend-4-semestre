import { CheckCircle2, FileText, Hourglass, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface OverviewStatsProps {
  total: number
  inProgress: number
  approved: number
  closed: number
}

const TONES = {
  primary: "bg-primary-subtle text-primary-subtle-foreground",
  info: "bg-info-subtle text-info",
  success: "bg-success-subtle text-success-foreground",
  neutral: "bg-muted text-muted-foreground",
} as const

export function OverviewStats({ total, inProgress, approved, closed }: OverviewStatsProps) {
  const stats = [
    { label: "Candidaturas", value: total, icon: FileText, tone: "primary" },
    { label: "Em andamento", value: inProgress, icon: Hourglass, tone: "info" },
    { label: "Aprovadas", value: approved, icon: CheckCircle2, tone: "success" },
    { label: "Encerradas", value: closed, icon: XCircle, tone: "neutral" },
  ] as const

  return (
    <dl className="grid grid-cols-2 overflow-hidden rounded-card border border-border bg-card lg:grid-cols-4">
      {stats.map(({ label, value, icon: Icon, tone }, index) => (
        <div
          key={label}
          className={cn(
            "flex items-center gap-3 p-4 sm:gap-4 sm:p-5",
            index % 2 === 1 && "border-l border-border",
            index >= 2 && "border-t border-border lg:border-t-0",
            index === 2 && "lg:border-l",
          )}
        >
          <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", TONES[tone])}>
            <Icon aria-hidden className="size-5" />
          </span>
          <div className="min-w-0">
            <dt className="truncate text-xs font-medium text-muted-foreground sm:text-sm">{label}</dt>
            <dd className="text-2xl font-semibold tracking-tight tabular-nums text-foreground">{value}</dd>
          </div>
        </div>
      ))}
    </dl>
  )
}
