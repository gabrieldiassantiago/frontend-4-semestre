import Link from "next/link"
import { ArrowDownRight, ArrowUpRight, Minus, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export function KpiCard({ label, value, icon: Icon, featured, href, note, delta }: {
  label: string
  value: number | string
  icon: LucideIcon
  featured?: boolean
  href: string
  note: string
  delta?: number | null
}) {
  return (
    <Link href={href} className={cn(
      "group flex min-w-0 flex-col justify-between gap-4 rounded-xl p-4 transition-colors focus-visible:outline-primary sm:p-5",
      featured ? "bg-primary text-primary-foreground hover:bg-primary-hover" : "bg-surface text-ink hover:bg-primary-subtle",
    )}>
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-medium">{label}</span>
        <Icon aria-hidden className="size-4 shrink-0 opacity-75" />
      </div>
      <div>
        <p className="text-4xl font-medium leading-none tracking-tight tabular-nums sm:text-5xl">{value}</p>
        <div className={cn("mt-2 flex flex-wrap items-center gap-1.5 text-xs leading-5", featured ? "text-white" : "text-muted-foreground")}>
          {delta !== undefined && <DeltaPill delta={delta} />}
          <span>{note}</span>
        </div>
      </div>
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
      title="Variação em relação aos 7 dias anteriores"
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
